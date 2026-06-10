package com.bolt.clientmanager.repository;

import com.bolt.clientmanager.model.UnidadeConsumidora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnidadeConsumidoraRepository extends JpaRepository<UnidadeConsumidora, Long> {
    Optional<UnidadeConsumidora> findByNumeroInstalacao(String numeroInstalacao);
    boolean existsByNumeroInstalacao(String numeroInstalacao);
}
