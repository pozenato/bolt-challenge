package com.bolt.clientmanager.model;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    @NotBlank(message = "CEP é obrigatório")
    @Pattern(regexp = "\\d{8}|\\d{5}-\\d{3}", message = "CEP inválido. Use 8 dígitos (ex: 12345678 ou 12345-678)")
    private String cep;

    private String logradouro;
    private String bairro;
    private String localidade;
    
    @NotBlank(message = "UF é obrigatória")
    private String uf;
    
    @NotBlank(message = "Número é obrigatório")
    private String numero;
    
    private String complemento;

    /**
     * Retorna o CEP contendo apenas números.
     */
    public String getCepNumerico() {
        if (cep == null) return null;
        return cep.replaceAll("\\D", "");
    }
}
