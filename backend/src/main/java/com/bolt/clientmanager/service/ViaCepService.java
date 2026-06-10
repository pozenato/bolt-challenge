package com.bolt.clientmanager.service;

import com.bolt.clientmanager.dto.ViaCepResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepService {

    private final RestTemplate restTemplate;

    @Autowired
    public ViaCepService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ViaCepResponseDto buscarCep(String cep) {
        if (cep == null) {
            return null;
        }
        
        // Limpa o CEP para conter apenas números
        String cepLimpo = cep.replaceAll("\\D", "");
        
        if (cepLimpo.length() != 8) {
            throw new IllegalArgumentException("CEP deve conter exatamente 8 dígitos.");
        }

        String url = "https://viacep.com.br/ws/" + cepLimpo + "/json/";
        
        try {
            ViaCepResponseDto response = restTemplate.getForObject(url, ViaCepResponseDto.class);
            if (response == null || "true".equals(response.getErro())) {
                throw new RuntimeException("CEP não encontrado: " + cep);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao consultar CEP no ViaCEP: " + e.getMessage(), e);
        }
    }
}
