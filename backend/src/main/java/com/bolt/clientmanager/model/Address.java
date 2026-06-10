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
public class Address {

    @NotBlank(message = "CEP is required")
    @Pattern(regexp = "\\d{8}|\\d{5}-\\d{3}", message = "Invalid CEP. Use 8 digits (ex: 12345678 or 12345-678)")
    private String cep;

    private String street;
    private String neighborhood;
    private String city;
    
    @NotBlank(message = "State (UF) is required")
    private String state;
    
    @NotBlank(message = "Number is required")
    private String number;
    
    private String complement;

    /**
     * Returns the CEP containing only numbers.
     */
    public String getNumericCep() {
        if (cep == null) return null;
        return cep.replaceAll("\\D", "");
    }
}
