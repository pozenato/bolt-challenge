package com.bolt.clientmanager.repository;

import com.bolt.clientmanager.model.ConsumerUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsumerUnitRepository extends JpaRepository<ConsumerUnit, Long> {
    Optional<ConsumerUnit> findByInstallationNumber(String installationNumber);
    boolean existsByInstallationNumber(String installationNumber);
}
