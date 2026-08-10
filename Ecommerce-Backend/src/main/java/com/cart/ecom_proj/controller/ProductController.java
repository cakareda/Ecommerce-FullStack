package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // React Vite Varsayılan Portu
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @PostMapping("/products")
    public ResponseEntity<?> addProduct(@RequestPart("product") Product product, 
                                       @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        try {
            Product savedProduct = service.addProduct(product, imageFile);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/products/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId) {
        Product product = service.getProductById(productId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(product.getImageType()))
                .body(product.getImageData());
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable int id,
                                           @RequestPart("product") Product product,
                                           @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        try {
            Product updatedProduct = service.updateProduct(id, product, imageFile);
            return ResponseEntity.ok(updatedProduct);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image processing error");
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        service.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(service.searchProducts(keyword));
    }
}