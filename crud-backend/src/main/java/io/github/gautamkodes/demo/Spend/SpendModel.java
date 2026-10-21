package io.github.gautamkodes.demo.Spend;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;
import java.util.Date;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long spendId;
    private Long userId;
    private Float amount;
    private String category;
    private Date date;
    private Time time;
    private String remark;
}
