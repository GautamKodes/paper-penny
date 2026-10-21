package io.github.gautamkodes.demo.Spend;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.util.Date;
import java.util.List;

@Service
public class SpendService {

    private final SpendRepo spendRepo;
    private final Mapper mapper;

    public SpendService(SpendRepo spendRepo, Mapper mapper) {
        this.spendRepo = spendRepo;
        this.mapper = mapper;
    }

    @CacheEvict(value = {"spends-all", "spends-by-user"}, allEntries = true)
    public SpendResponse addSpend(SpendRequest spendRequest) {
        SpendModel spendModel = mapper.toModel(spendRequest);
        spendModel.setDate(new Date());
        spendModel.setTime(new Time(System.currentTimeMillis()));
        SpendModel saved = spendRepo.save(spendModel);
        return mapper.toResponse(saved);
    }

    @Cacheable(value = "spends-all")
    public List<SpendResponse> getAllSpends() {
        return spendRepo.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Cacheable(value = "spends-by-user", key = "#userId")
    public List<SpendResponse> getSpendsByUser(Long userId) {
        return spendRepo.findByUserId(userId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @CacheEvict(value = {"spends-all", "spends-by-user"}, allEntries = true)
    public void deleteSpend(Long spendId) {
        spendRepo.deleteById(spendId);
    }
}
