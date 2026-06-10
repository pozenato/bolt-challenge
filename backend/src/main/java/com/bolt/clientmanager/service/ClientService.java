package com.bolt.clientmanager.service;

import com.bolt.clientmanager.dto.ViaCepResponseDto;
import com.bolt.clientmanager.event.ClientMgAnalysisEvent;
import com.bolt.clientmanager.exception.BusinessException;
import com.bolt.clientmanager.model.Client;
import com.bolt.clientmanager.model.Address;
import com.bolt.clientmanager.model.ConsumerUnit;
import com.bolt.clientmanager.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final ViaCepService viaCepService;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public ClientService(ClientRepository clientRepository,
                          ViaCepService viaCepService,
                          ApplicationEventPublisher eventPublisher) {
        this.clientRepository = clientRepository;
        this.viaCepService = viaCepService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public List<Client> listAll() {
        return clientRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Client> listRecent() {
        return clientRepository.findTop20ByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Client not found with ID: " + id));
    }

    @Transactional
    public Client create(Client client) {
        // Normalize the document (remove formatting)
        String numericDoc = client.getNumericDocument();
        client.setDocument(numericDoc);

        // Validate uniqueness of the document
        if (clientRepository.existsByDocument(numericDoc)) {
            throw new BusinessException("A client with this document is already registered.");
        }

        // Fill client address details via ViaCEP
        fillAddress(client.getClientAddress());

        // Process and validate consumer units
        if (client.getConsumerUnits() != null) {
            for (ConsumerUnit unit : client.getConsumerUnits()) {
                fillAddress(unit.getAddress());
                validateRegion(unit.getAddress().getState());
                unit.setClient(client);
            }
        }

        Client savedClient = clientRepository.save(client);

        // If there is any consumer unit in MG, publish the event
        if (hasUnitInMg(savedClient)) {
            eventPublisher.publishEvent(new ClientMgAnalysisEvent(this, savedClient));
        }

        return savedClient;
    }

    @Transactional
    public Client update(Long id, Client updatedClient) {
        Client existingClient = findById(id);

        // Normalize updated document
        String numericDoc = updatedClient.getNumericDocument();

        // Validate uniqueness if document has changed
        if (!existingClient.getDocument().equals(numericDoc)) {
            if (clientRepository.existsByDocument(numericDoc)) {
                throw new BusinessException("A client with this document is already registered.");
            }
            existingClient.setDocument(numericDoc);
        }

        existingClient.setName(updatedClient.getName());
        if (updatedClient.getActive() != null) {
            existingClient.setActive(updatedClient.getActive());
        }

        // Fill client address details
        fillAddress(updatedClient.getClientAddress());
        existingClient.setClientAddress(updatedClient.getClientAddress());

        // Clear old consumer units and insert validated new ones
        existingClient.getConsumerUnits().clear();
        if (updatedClient.getConsumerUnits() != null) {
            for (ConsumerUnit unit : updatedClient.getConsumerUnits()) {
                fillAddress(unit.getAddress());
                validateRegion(unit.getAddress().getState());
                existingClient.addConsumerUnit(unit);
            }
        }

        return clientRepository.save(existingClient);
    }

    @Transactional
    public void softDelete(Long id) {
        Client client = findById(id);
        client.setActive(false);
        clientRepository.save(client);
    }

    private void fillAddress(Address address) {
        if (address == null || address.getCep() == null) {
            throw new BusinessException("Address and CEP are required.");
        }
        try {
            ViaCepResponseDto viaCep = viaCepService.buscarCep(address.getCep());
            address.setCep(viaCep.getCep()); // Keep formatted Cep or formatted from ViaCEP
            address.setStreet(viaCep.getLogradouro());
            address.setNeighborhood(viaCep.getBairro());
            address.setCity(viaCep.getLocalidade());
            address.setState(viaCep.getUf());
        } catch (Exception e) {
            throw new BusinessException("CEP error: " + e.getMessage());
        }
    }

    private void validateRegion(String state) {
        if (state == null) return;
        String stateUpper = state.trim().toUpperCase();
        if ("SP".equals(stateUpper) || "RS".equals(stateUpper) || "PR".equals(stateUpper)) {
            throw new BusinessException("Clients with consumer units in " + stateUpper + " cannot be registered as we do not operate in this region.");
        }
    }

    private boolean hasUnitInMg(Client client) {
        if (client.getConsumerUnits() == null) return false;
        return client.getConsumerUnits().stream()
                .anyMatch(unit -> unit.getAddress() != null && "MG".equalsIgnoreCase(unit.getAddress().getState()));
    }
}
