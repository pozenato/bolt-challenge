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
@Table(name = "consumer_units")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "client")
public class ConsumerUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Consumer unit name is required")
    private String name;

    @NotBlank(message = "Installation number is required")
    private String installationNumber;

    @NotNull(message = "Consumer unit address is required")
    @Valid
    @Embedded
    private Address address;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    @JsonBackReference
    private Client client;
}
