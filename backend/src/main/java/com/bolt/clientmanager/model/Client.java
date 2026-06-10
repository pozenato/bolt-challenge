package com.bolt.clientmanager.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.PrePersist;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Document is required")
    @Column(unique = true, nullable = false)
    private String document;

    @NotNull(message = "Client address is required")
    @Valid
    @Embedded
    private Address clientAddress;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<ConsumerUnit> consumerUnits = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @PrePersist
    public void prePersist() {
        if (active == null) {
            active = true;
        }
    }

    // Helper method to maintain bi-directional relationship
    public void addConsumerUnit(ConsumerUnit unit) {
        if (consumerUnits == null) {
            consumerUnits = new ArrayList<>();
        }
        consumerUnits.add(unit);
        unit.setClient(this);
    }
    
    // Normalize document (remove masks) before saving
    public String getNumericDocument() {
        if (document == null) return null;
        return document.replaceAll("\\D", "");
    }
}
