package io.github.gautamkodes.demo.Spend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/spend")
public class SpendController {

    private final SpendService spendService;

    public SpendController(SpendService spendService) {
        this.spendService = spendService;
    }

    @PostMapping
    public ResponseEntity<SpendResponse> addSpend(@RequestBody SpendRequest spendRequest) {
        return ResponseEntity.ok(spendService.addSpend(spendRequest));
    }

    @GetMapping
    public ResponseEntity<List<SpendResponse>> getAllSpends() {
        return ResponseEntity.ok(spendService.getAllSpends());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SpendResponse>> getSpendsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(spendService.getSpendsByUser(userId));
    }

    @DeleteMapping("/{spendId}")
    public ResponseEntity<Void> deleteSpend(@PathVariable Long spendId) {
        spendService.deleteSpend(spendId);
        return ResponseEntity.noContent().build();
    }
}