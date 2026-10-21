package io.github.gautamkodes.demo.Spend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpendRepo extends JpaRepository<SpendModel, Long> {
    List<SpendModel> findByUserId(Long userId);
}
