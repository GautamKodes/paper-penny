package io.github.gautamkodes.demo.Spend;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;
import java.util.Date;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendResponse {
    private Long userId;
    private Long spendId;
    private Float amount;
    private String category;
    private String remark;
    private Date date;
    private Time time;
}
