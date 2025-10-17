package com.securebank.creditanalyzer.repository;

import com.google.gson.reflect.TypeToken;
import com.securebank.creditanalyzer.model.User;
import com.securebank.creditanalyzer.util.JsonStorageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class UserRepository {

    @Value("${app.data.path}users.json")
    private String usersFilePath;

    @Autowired
    private JsonStorageUtil jsonStorage;

    private static final Type USER_LIST_TYPE = new TypeToken<List<User>>(){}.getType();

    public List<User> findAll() {
        return jsonStorage.readList(usersFilePath, USER_LIST_TYPE);
    }

    public Optional<User> findById(String id) {
        return findAll().stream()
                .filter(user -> user.getId().equals(id))
                .findFirst();
    }

    public Optional<User> findByEmail(String email) {
        return findAll().stream()
                .filter(user -> user.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    public User save(User user) {
        List<User> users = findAll();

        if (user.getId() == null || user.getId().isEmpty()) {
            user.setId("usr_" + UUID.randomUUID().toString().substring(0, 8));
        }

        users.removeIf(u -> u.getId().equals(user.getId()));
        users.add(user);

        jsonStorage.writeList(usersFilePath, users);
        return user;
    }

    public void deleteById(String id) {
        List<User> users = findAll();
        users.removeIf(user -> user.getId().equals(id));
        jsonStorage.writeList(usersFilePath, users);
    }
}