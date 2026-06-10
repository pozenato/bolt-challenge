package com.bolt.clientmanager.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "unidades_consumidoras")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "cliente")
public class UnidadeConsumidora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome da unidade consumidora é obrigatório")
    private String nome;

    @NotBlank(message = "Número de instalação é obrigatório")
    private String numeroInstalacao;

    @NotNull(message = "Endereço da unidade consumidora é obrigatório")
    @Valid
    @Embedded
    private Endereco endereco;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    @JsonBackReference
    private Cliente cliente;
}
