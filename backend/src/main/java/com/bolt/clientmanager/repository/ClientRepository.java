package com.bolt.clientmanager.repository;

import com.bolt.clientmanager.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    boolean existsByDocument(String document);
    
    Optional<Client> findByDocument(String document);
    
    List<Client> findTop20ByOrderByCreatedAtDesc();
    
    List<Client> findAllByOrderByCreatedAtDesc();
}
