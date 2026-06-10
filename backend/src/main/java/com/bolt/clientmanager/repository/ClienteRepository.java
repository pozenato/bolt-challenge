package com.bolt.clientmanager.repository;

import com.bolt.clientmanager.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    boolean existsByDocumento(String documento);
    
    Optional<Cliente> findByDocumento(String documento);
    
    List<Cliente> findTop20ByOrderByCreatedAtDesc();
    
    List<Cliente> findAllByOrderByCreatedAtDesc();
}
