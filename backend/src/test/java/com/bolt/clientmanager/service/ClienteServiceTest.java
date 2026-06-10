package com.bolt.clientmanager.service;

import com.bolt.clientmanager.dto.ViaCepResponseDto;
import com.bolt.clientmanager.event.ClienteAnaliseMgEvent;
import com.bolt.clientmanager.exception.BusinessException;
import com.bolt.clientmanager.model.Cliente;
import com.bolt.clientmanager.model.Endereco;
import com.bolt.clientmanager.model.UnidadeConsumidora;
import com.bolt.clientmanager.repository.ClienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ViaCepService viaCepService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ClienteService clienteService;

    private Cliente clienteValido;
    private ViaCepResponseDto responseCepValido;
    private ViaCepResponseDto responseCepMg;
    private ViaCepResponseDto responseCepSp;

    @BeforeEach
    void setUp() {
        clienteValido = Cliente.builder()
                .nome("João da Silva")
                .documento("123.456.789-00")
                .enderecoCliente(Endereco.builder().cep("88010-000").numero("123").build())
                .unidadesConsumidoras(new ArrayList<>())
                .build();

        responseCepValido = new ViaCepResponseDto();
        responseCepValido.setCep("88010-000");
        responseCepValido.setLogradouro("Rua Central");
        responseCepValido.setBairro("Centro");
        responseCepValido.setLocalidade("Florianópolis");
        responseCepValido.setUf("SC");

        responseCepMg = new ViaCepResponseDto();
        responseCepMg.setCep("30130-000");
        responseCepMg.setLogradouro("Av. Afonso Pena");
        responseCepMg.setBairro("Centro");
        responseCepMg.setLocalidade("Belo Horizonte");
        responseCepMg.setUf("MG");

        responseCepSp = new ViaCepResponseDto();
        responseCepSp.setCep("01001-000");
        responseCepSp.setLogradouro("Praça da Sé");
        responseCepSp.setBairro("Sé");
        responseCepSp.setLocalidade("São Paulo");
        responseCepSp.setUf("SP");
    }

    @Test
    void cadastrar_ComSucesso() {
        // Arrange
        when(clienteRepository.existsByDocumento(anyString())).thenReturn(false);
        when(viaCepService.buscarCep("88010-000")).thenReturn(responseCepValido);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Cliente resultado = clienteService.cadastrar(clienteValido);

        // Assert
        assertNotNull(resultado);
        assertEquals("12345678900", resultado.getDocumento());
        assertEquals("SC", resultado.getEnderecoCliente().getUf());
        verify(clienteRepository, times(1)).save(any(Cliente.class));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void cadastrar_DocumentoDuplicado_DeveLancarExcecao() {
        // Arrange
        when(clienteRepository.existsByDocumento("12345678900")).thenReturn(true);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            clienteService.cadastrar(clienteValido);
        });

        assertEquals("Já existe um cliente cadastrado com o documento informado.", exception.getMessage());
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void cadastrar_RegiaoNaoAtendidaSp_DeveLancarExcecao() {
        // Arrange
        clienteValido.addUnidadeConsumidora(UnidadeConsumidora.builder()
                .nome("Minha filial")
                .numeroInstalacao("9999")
                .endereco(Endereco.builder().cep("01001-000").numero("50").build())
                .build());

        when(clienteRepository.existsByDocumento(anyString())).thenReturn(false);
        when(viaCepService.buscarCep("88010-000")).thenReturn(responseCepValido);
        when(viaCepService.buscarCep("01001-000")).thenReturn(responseCepSp);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            clienteService.cadastrar(clienteValido);
        });

        assertTrue(exception.getMessage().contains("não atendemos a essa região"));
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void cadastrar_UnidadeMg_DevePublicarEvento() {
        // Arrange
        clienteValido.addUnidadeConsumidora(UnidadeConsumidora.builder()
                .nome("Filial MG")
                .numeroInstalacao("8888")
                .endereco(Endereco.builder().cep("30130-000").numero("10").build())
                .build());

        when(clienteRepository.existsByDocumento(anyString())).thenReturn(false);
        when(viaCepService.buscarCep("88010-000")).thenReturn(responseCepValido);
        when(viaCepService.buscarCep("30130-000")).thenReturn(responseCepMg);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Cliente resultado = clienteService.cadastrar(clienteValido);

        // Assert
        assertNotNull(resultado);
        verify(eventPublisher, times(1)).publishEvent(any(ClienteAnaliseMgEvent.class));
    }

    @Test
    void deletarLogico_DeveDefinirAtivoComoFalse() {
        // Arrange
        clienteValido.setId(1L);
        clienteValido.setAtivo(true);
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteValido));

        // Act
        clienteService.deletarLogico(1L);

        // Assert
        assertFalse(clienteValido.getAtivo());
        verify(clienteRepository, times(1)).save(clienteValido);
    }
}
