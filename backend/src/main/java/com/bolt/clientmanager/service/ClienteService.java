package com.bolt.clientmanager.service;

import com.bolt.clientmanager.dto.ViaCepResponseDto;
import com.bolt.clientmanager.event.ClienteAnaliseMgEvent;
import com.bolt.clientmanager.exception.BusinessException;
import com.bolt.clientmanager.model.Cliente;
import com.bolt.clientmanager.model.Endereco;
import com.bolt.clientmanager.model.UnidadeConsumidora;
import com.bolt.clientmanager.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ViaCepService viaCepService;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository,
                          ViaCepService viaCepService,
                          ApplicationEventPublisher eventPublisher) {
        this.clienteRepository = clienteRepository;
        this.viaCepService = viaCepService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarTodos() {
        return clienteRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarRecentes() {
        return clienteRepository.findTop20ByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Cliente obterPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Cliente não encontrado com ID: " + id));
    }

    @Transactional
    public Cliente cadastrar(Cliente cliente) {
        // Normaliza o documento (remove formatação)
        String docNumerico = cliente.getDocumentoNumerico();
        cliente.setDocumento(docNumerico);

        // Valida unicidade do documento
        if (clienteRepository.existsByDocumento(docNumerico)) {
            throw new BusinessException("Já existe um cliente cadastrado com o documento informado.");
        }

        // Preenche o endereço do cliente via ViaCEP
        preencherEndereco(cliente.getEnderecoCliente());

        // Processa e valida as unidades consumidoras
        if (cliente.getUnidadesConsumidoras() != null) {
            for (UnidadeConsumidora uc : cliente.getUnidadesConsumidoras()) {
                preencherEndereco(uc.getEndereco());
                validarRegiao(uc.getEndereco().getUf());
                uc.setCliente(cliente);
            }
        }

        Cliente clienteSalvo = clienteRepository.save(cliente);

        // Verifica se há unidade consumidora em MG e publica no evento
        if (possuiUnidadeEmMg(clienteSalvo)) {
            eventPublisher.publishEvent(new ClienteAnaliseMgEvent(this, clienteSalvo));
        }

        return clienteSalvo;
    }

    @Transactional
    public Cliente atualizar(Long id, Cliente clienteAtualizado) {
        Cliente clienteExistente = obterPorId(id);

        // Normaliza o documento atualizado
        String docNumerico = clienteAtualizado.getDocumentoNumerico();

        // Valida unicidade se o documento mudou
        if (!clienteExistente.getDocumento().equals(docNumerico)) {
            if (clienteRepository.existsByDocumento(docNumerico)) {
                throw new BusinessException("Já existe um cliente cadastrado com o documento informado.");
            }
            clienteExistente.setDocumento(docNumerico);
        }

        clienteExistente.setNome(clienteAtualizado.getNome());
        clienteExistente.setAtivo(clienteAtualizado.getAtivo());

        // Preenche endereço do cliente
        preencherEndereco(clienteAtualizado.getEnderecoCliente());
        clienteExistente.setEnderecoCliente(clienteAtualizado.getEnderecoCliente());

        // Limpa as unidades antigas e reinsere as novas validadas
        clienteExistente.getUnidadesConsumidoras().clear();
        if (clienteAtualizado.getUnidadesConsumidoras() != null) {
            for (UnidadeConsumidora uc : clienteAtualizado.getUnidadesConsumidoras()) {
                preencherEndereco(uc.getEndereco());
                validarRegiao(uc.getEndereco().getUf());
                clienteExistente.addUnidadeConsumidora(uc);
            }
        }

        return clienteRepository.save(clienteExistente);
    }

    @Transactional
    public void deletarLogico(Long id) {
        Cliente cliente = obterPorId(id);
        cliente.setAtivo(false);
        clienteRepository.save(cliente);
    }

    private void preencherEndereco(Endereco endereco) {
        if (endereco == null || endereco.getCep() == null) {
            throw new BusinessException("Endereço e CEP são obrigatórios.");
        }
        try {
            ViaCepResponseDto viaCep = viaCepService.buscarCep(endereco.getCep());
            endereco.setCep(viaCep.getCep()); // Atualiza para o formato formatado do ViaCEP ou mantém o limpo
            endereco.setLogradouro(viaCep.getLogradouro());
            endereco.setBairro(viaCep.getBairro());
            endereco.setLocalidade(viaCep.getLocalidade());
            endereco.setUf(viaCep.getUf());
        } catch (Exception e) {
            throw new BusinessException("Erro de CEP: " + e.getMessage());
        }
    }

    private void validarRegiao(String uf) {
        if (uf == null) return;
        String ufUpper = uf.trim().toUpperCase();
        if ("SP".equals(ufUpper) || "RS".equals(ufUpper) || "PR".equals(ufUpper)) {
            throw new BusinessException("Clientes com unidade consumidora no estado de " + ufUpper + " não podem ser cadastrados pois não atendemos a essa região.");
        }
    }

    private boolean possuiUnidadeEmMg(Cliente cliente) {
        if (cliente.getUnidadesConsumidoras() == null) return false;
        return cliente.getUnidadesConsumidoras().stream()
                .anyMatch(uc -> uc.getEndereco() != null && "MG".equalsIgnoreCase(uc.getEndereco().getUf()));
    }
}
