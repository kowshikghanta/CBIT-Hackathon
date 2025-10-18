package com.securebank.creditanalyzer.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import org.springframework.stereotype.Component;

import java.io.*;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class JsonStorageUtil {
    private final Gson gson;

    public JsonStorageUtil() {
        this.gson = new GsonBuilder()
                .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter()) // Register adapter
                .setPrettyPrinting()
                .create();
    }

    public <T> List<T> readList(String filePath, Type typeToken) {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                file.getParentFile().mkdirs();
                return new ArrayList<>();
            }

            String json = new String(Files.readAllBytes(Paths.get(filePath)));
            if (json.isEmpty()) {
                return new ArrayList<>();
            }

            return gson.fromJson(json, typeToken);
        } catch (IOException e) {
            System.err.println("Error reading JSON file: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public <T> T readObject(String filePath, Class<T> classType) {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                return null;
            }

            String json = new String(Files.readAllBytes(Paths.get(filePath)));
            return gson.fromJson(json, classType);
        } catch (IOException e) {
            System.err.println("Error reading JSON file: " + e.getMessage());
            return null;
        }
    }

    public <T> void writeList(String filePath, List<T> data) {
        try {
            File file = new File(filePath);
            file.getParentFile().mkdirs();

            String json = gson.toJson(data);
            Files.write(Paths.get(filePath), json.getBytes());
        } catch (IOException e) {
            System.err.println("Error writing JSON file: " + e.getMessage());
        }
    }

    public <T> void writeObject(String filePath, T data) {
        try {
            File file = new File(filePath);
            file.getParentFile().mkdirs();

            String json = gson.toJson(data);
            Files.write(Paths.get(filePath), json.getBytes());
        } catch (IOException e) {
            System.err.println("Error writing JSON file: " + e.getMessage());
        }
    }
}
