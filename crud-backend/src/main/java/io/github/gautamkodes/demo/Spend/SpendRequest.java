package io.github.gautamkodes.demo.Spend;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendRequest {
    private Long userId;
    private Float amount;
    private String category;
    private String remark;
}
