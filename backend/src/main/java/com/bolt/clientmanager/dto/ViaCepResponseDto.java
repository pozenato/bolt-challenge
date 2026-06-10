package com.bolt.clientmanager.dto;

import lombok.Data;

@Data
public class ViaCepResponseDto {
    private String cep;
    private String logradouro;
    private String complemento;
    private String bairro;
    private String localidade;
    private String uf;
    private String erro;
}
