package com.bolt.clientmanager.service;

import com.bolt.clientmanager.dto.ViaCepResponseDto;
import com.bolt.clientmanager.event.ClientMgAnalysisEvent;
import com.bolt.clientmanager.exception.BusinessException;
import com.bolt.clientmanager.model.Client;
import com.bolt.clientmanager.model.Address;
import com.bolt.clientmanager.model.ConsumerUnit;
import com.bolt.clientmanager.repository.ClientRepository;
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
public class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ViaCepService viaCepService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ClientService clientService;

    private Client validClient;
    private ViaCepResponseDto responseCepValido;
    private ViaCepResponseDto responseCepMg;
    private ViaCepResponseDto responseCepSp;

    @BeforeEach
    void setUp() {
        validClient = Client.builder()
                .name("João da Silva")
                .document("123.456.789-00")
                .clientAddress(Address.builder().cep("88010-000").number("123").build())
                .consumerUnits(new ArrayList<>())
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
    void create_WithSuccess() {
        // Arrange
        when(clientRepository.existsByDocument(anyString())).thenReturn(false);
        when(viaCepService.buscarCep("88010-000")).thenReturn(responseCepValido);
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Client result = clientService.create(validClient);

        // Assert
        assertNotNull(result);
        assertEquals("12345678900", result.getDocument());
        assertEquals("SC", result.getClientAddress().getState());
        verify(clientRepository, times(1)).save(any(Client.class));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void create_DuplicateDocument_ThrowsException() {
        // Arrange
        when(clientRepository.existsByDocument("12345678900")).thenReturn(true);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            clientService.create(validClient);
        });

        assertEquals("A client with this document is already registered.", exception.getMessage());
        verify(clientRepository, never()).save(any());
    }

    @Test
    void create_UnservedRegionSp_ThrowsException() {
        // Arrange
        validClient.addConsumerUnit(ConsumerUnit.builder()
                .name("My branch")
                .installationNumber("9999")
                .address(Address.builder().cep("01001-000").number("50").build())
                .build());

        when(clientRepository.existsByDocument(anyString())).thenReturn(false);
        when(viaCepService.buscarCep("88010-000")).thenReturn(responseCepValido);
        when(viaCepService.buscarCep("01001-000")).thenReturn(responseCepSp);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            clientService.create(validClient);
        });

        assertTrue(exception.getMessage().contains("cannot be registered as we do not operate in this region"));
        verify(clientRepository, never()).save(any());
    }

    @Test
    void create_UnitMg_PublishesEvent() {
        // Arrange
        validClient.addConsumerUnit(ConsumerUnit.builder()
                .name("Branch MG")
                .installationNumber("8888")
                .address(Address.builder().cep("30130-000").number("10").build())
                .build());

        when(clientRepository.existsByDocument(anyString())).thenReturn(false);
        when(viaCepService.buscarCep("88010-000")).thenReturn(responseCepValido);
        when(viaCepService.buscarCep("30130-000")).thenReturn(responseCepMg);
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Client result = clientService.create(validClient);

        // Assert
        assertNotNull(result);
        verify(eventPublisher, times(1)).publishEvent(any(ClientMgAnalysisEvent.class));
    }

    @Test
    void softDelete_SetsActiveToFalse() {
        // Arrange
        validClient.setId(1L);
        validClient.setActive(true);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));

        // Act
        clientService.softDelete(1L);

        // Assert
        assertFalse(validClient.getActive());
        verify(clientRepository, times(1)).save(validClient);
    }
}
