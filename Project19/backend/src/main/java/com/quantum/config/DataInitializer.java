package com.quantum.config;

import com.quantum.entity.Tutorial;
import com.quantum.repository.TutorialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Autowired
    private TutorialRepository tutorialRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (tutorialRepository.count() == 0) {
                Tutorial t1 = new Tutorial();
                t1.setTitle("量子计算入门：什么是量子比特？");
                t1.setContent("## 量子比特简介\n\n经典计算机使用比特（bit）作为基本信息单元，只能处于0或1两种状态。而量子计算机使用量子比特（qubit），可以同时处于0和1的叠加态。\n\n### 量子比特的状态表示\n\n量子比特的状态可以用布洛赫球来表示：\n- |0⟩ 表示基态\n- |1⟩ 表示激发态\n- 任意量子态可以表示为 α|0⟩ + β|1⟩，其中 α² + β² = 1\n\n### 关键特性\n\n1. **叠加性**：量子比特可以同时处于多个状态\n2. **纠缠性**：多个量子比特可以纠缠在一起\n3. **干涉性**：量子态可以产生干涉现象");
                t1.setCategory("基础概念");
                t1.setDifficulty(1);
                t1.setCircuitExample("H");
                tutorialRepository.save(t1);

                Tutorial t2 = new Tutorial();
                t2.setTitle("量子门基础：Hadamard门与叠加态");
                t2.setContent("## Hadamard门\n\nHadamard门是最常用的单量子比特门之一，它可以将基态转换为叠加态。\n\n### 数学表示\n\nH = (1/√2) × [[1, 1], [1, -1]]\n\n### 作用效果\n\n- H|0⟩ = (|0⟩ + |1⟩)/√2\n- H|1⟩ = (|0⟩ - |1⟩)/√2\n\n### 实验演示\n\n1. 初始化量子比特为 |0⟩\n2. 应用 Hadamard 门\n3. 观察叠加态的产生\n4. 测量得到随机结果");
                t2.setCategory("量子门");
                t2.setDifficulty(1);
                t2.setCircuitExample("H");
                tutorialRepository.save(t2);

                Tutorial t3 = new Tutorial();
                t3.setTitle("Pauli门系列：X、Y、Z门");
                t3.setContent("## Pauli门\n\nPauli门是量子计算中最基本的门，包括X、Y、Z三个门。\n\n### X门（Pauli-X）\n- 相当于经典的NOT门\n- X|0⟩ = |1⟩, X|1⟩ = |0⟩\n\n### Y门（Pauli-Y）\n- Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩\n\n### Z门（Pauli-Z）\n- 相位翻转门\n- Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩");
                t3.setCategory("量子门");
                t3.setDifficulty(1);
                t3.setCircuitExample("X");
                tutorialRepository.save(t3);

                Tutorial t4 = new Tutorial();
                t4.setTitle("量子纠缠：Bell态的制备");
                t4.setContent("## 量子纠缠\n\n量子纠缠是量子力学中最神秘的现象之一，两个纠缠的量子比特无论相隔多远，测量一个都会立即影响另一个。\n\n### Bell态制备\n\nBell态是最简单的两量子比特纠缠态：\n\n|Φ+⟩ = (|00⟩ + |11⟩)/√2\n\n### 制备步骤\n\n1. 初始化两个量子比特为 |00⟩\n2. 对第一个量子比特应用 Hadamard 门\n3. 应用 CNOT 门（控制位：第一个，目标位：第二个）\n4. 得到纠缠态");
                t4.setCategory("量子算法");
                t4.setDifficulty(2);
                t4.setCircuitExample("H,CNOT");
                tutorialRepository.save(t4);

                Tutorial t5 = new Tutorial();
                t5.setTitle("多体纠缠：GHZ态");
                t5.setContent("## GHZ态\n\nGHZ态是三量子比特的最大纠缠态，是Bell态的推广。\n\n### GHZ态定义\n\n|GHZ⟩ = (|000⟩ + |111⟩)/√2\n\n### 制备步骤\n\n1. 初始化三个量子比特为 |000⟩\n2. 对第一个量子比特应用 Hadamard 门\n3. 依次应用 CNOT 门（q0→q1, q1→q2）\n4. 得到三量子比特纠缠态\n\n### 特性\n\nGHZ态展示了超越经典物理的量子关联特性");
                t5.setCategory("量子算法");
                t5.setDifficulty(2);
                t5.setCircuitExample("H,CNOT,CNOT");
                tutorialRepository.save(t5);

                Tutorial t6 = new Tutorial();
                t6.setTitle("量子搜索：Grover算法");
                t6.setContent("## Grover算法\n\nGrover算法是一种用于无序数据库搜索的量子算法，相比经典算法提供二次加速。\n\n### 算法原理\n\n1. **Oracle**：标记目标状态\n2. **扩散算子**：放大目标状态的振幅\n3. **迭代**：重复应用Oracle和扩散算子\n\n### 复杂度\n\n- 经典搜索：O(N)\n- 量子搜索：O(√N)\n\n### 示例\n\n在4个元素中搜索特定目标，Grover算法只需约1次迭代即可高概率找到目标。");
                t6.setCategory("量子算法");
                t6.setDifficulty(4);
                t6.setCircuitExample("Grover");
                tutorialRepository.save(t6);

                Tutorial t7 = new Tutorial();
                t7.setTitle("量子通信：量子隐形传态");
                t7.setContent("## 量子隐形传态\n\n量子隐形传态利用经典通信和预先共享的纠缠态，将一个量子态从一个位置传输到另一个位置。\n\n### 协议步骤\n\n1. 发送方和接收方共享一对纠缠的Bell对\n2. 发送方对要传送的量子比特和自己的纠缠比特进行Bell基测量\n3. 发送方将测量结果通过经典信道发送给接收方\n4. 接收方根据测量结果进行相应的幺正变换\n5. 接收方恢复出原始量子态\n\n### 要点\n\n- 不需要直接传输量子比特\n- 传输速度受限于经典信道\n- 量子态在传输过程中被破坏");
                t7.setCategory("量子通信");
                t7.setDifficulty(3);
                t7.setCircuitExample("Teleportation");
                tutorialRepository.save(t7);

                Tutorial t8 = new Tutorial();
                t8.setTitle("相位门与旋转门");
                t8.setContent("## 相位门\n\n相位门不改变量子态的振幅，只改变相位。\n\n### S门（相位门）\n- S|0⟩ = |0⟩\n- S|1⟩ = i|1⟩\n\n### T门（π/8门）\n- T|0⟩ = |0⟩\n- T|1⟩ = e^(iπ/4)|1⟩\n\n### 旋转门\n\n- Rx(θ)：绕X轴旋转\n- Ry(θ)：绕Y轴旋转\n- Rz(θ)：绕Z轴旋转\n\n旋转门可以实现任意的单量子比特操作。");
                t8.setCategory("量子门");
                t8.setDifficulty(2);
                t8.setCircuitExample("S,T");
                tutorialRepository.save(t8);

                System.out.println("初始数据已加载完成！");
            }
        };
    }
}
