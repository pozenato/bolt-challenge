package com.bolt.clientmanager.controller;

import com.bolt.clientmanager.model.Client;
import com.bolt.clientmanager.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
@Tag(name = "Clients", description = "API for client registration and management")
public class ClientController {

    private final ClientService clientService;

    @Autowired
    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    @Operation(summary = "List clients", description = "Returns a list of clients. Use 'recent=true' parameter to get only the last 20.")
    public ResponseEntity<List<Client>> list(@RequestParam(value = "recent", required = false, defaultValue = "false") boolean recent) {
        List<Client> clients = recent ? clientService.listRecent() : clientService.listAll();
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get client by ID", description = "Returns details of a client corresponding to the given ID.")
    public ResponseEntity<Client> findById(@PathVariable Long id) {
        Client client = clientService.findById(id);
        return ResponseEntity.ok(client);
    }

    @PostMapping
    @Operation(summary = "Register client", description = "Registers a new client and their consumer units, querying CEP addresses from ViaCEP.")
    public ResponseEntity<Client> create(@Valid @RequestBody Client client) {
        Client newClient = clientService.create(client);
        return ResponseEntity.status(HttpStatus.CREATED).body(newClient);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update client", description = "Updates details of an existing client and their respective consumer units.")
    public ResponseEntity<Client> update(@PathVariable Long id, @Valid @RequestBody Client clientDetails) {
        Client updatedClient = clientService.update(id, clientDetails);
        return ResponseEntity.ok(updatedClient);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete client (Soft Delete)", description = "Deactivates the client by setting active=false. The record is not physically deleted from the database.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
