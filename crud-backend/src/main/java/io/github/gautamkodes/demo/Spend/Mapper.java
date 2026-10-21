package io.github.gautamkodes.demo.Spend;

import org.springframework.stereotype.Component;

@Component
public class Mapper {

    public SpendResponse toResponse(SpendModel spendModel) {
        SpendResponse spendResponse = new SpendResponse();
        spendResponse.setUserId(spendModel.getUserId());
        spendResponse.setAmount(spendModel.getAmount());
        spendResponse.setCategory(spendModel.getCategory());
        spendResponse.setRemark(spendModel.getRemark());
        spendResponse.setDate(spendModel.getDate());
        spendResponse.setTime(spendModel.getTime());
        return spendResponse;
    }

    public SpendModel toModel(SpendRequest spendRequest) {
        SpendModel spendModel = new SpendModel();
        spendModel.setUserId(spendRequest.getUserId());
        spendModel.setAmount(spendRequest.getAmount());
        spendModel.setCategory(spendRequest.getCategory());
        spendModel.setRemark(spendRequest.getRemark());
        return spendModel;
    }
}
