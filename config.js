const GAME_CONFIG = {
    // 初始资源配置
    initial: {
        gold: 600,
        diamonds: 0,
        playerHP: 100,
        maxPlayerHP: 100,
        wave: 1,
        maxWave: 5
    },

    // 骰子价格配置
    diceCost: {
        normal: 100,
        elite: 150,
        universal: 300
    },

    // 骰子触发概率配置
    diceChance: {
        gem10: {
            normal: 0.1,    // 普通骰子：10%概率
            elite: 0.5,     // 精英骰子：50%概率
            universal: 1.0   // 万能骰子：100%概率
        },
        house: {
            normal: 0.1,    // 普通骰子：10%概率
            elite: 0.5,     // 精英骰子：50%概率
            universal: 1.0   // 万能骰子：100%概率
        },
        genie: {
            normal: 0.1,    // 普通骰子基础概率：10%
            elite: 0.35,    // 精英骰子基础概率：35%
            universal: 0.5   // 万能骰子基础概率：50%
        }
    },

    // 炮台配置
    tower: {
        upgradeCost: {
            level1: 10,  // 升级1级所需钻石
            level2: 20,  // 升级2级所需钻石
            level3: 30   // 升级3级所需钻石
        },
        damage: {
            level1: 2,   // 1级炮台伤害
            level2: 3,   // 2级炮台伤害
            level3: 4,   // 3级炮台伤害
            level4: 5    // 4级及以上炮台伤害
        },
        fireInterval: 800,  // 炮台射击间隔(ms)
        bulletSpeed: 12     // 子弹速度
    },

    // 怪物配置
    monster: {
        normal: {
            hp: 5,
            size: 12,
            reward: 20    // 击杀普通怪物金币奖励
        },
        boss: {
            hp: 100,
            size: 20,
            reward: 100,  // 击杀BOSS金币奖励
            damageToPlayer: 5  // BOSS对玩家造成的伤害
        }
    },

    // 波次配置
    waves: {
        1: {
            normalCount: 5,
            bossCount: 0
        },
        2: {
            normalCount: 6,
            bossCount: 1
        },
        3: {
            normalCount: 6,
            bossCount: 1
        },
        4: {
            normalCount: 6,
            bossCount: 2
        },
        5: {
            normalCount: 6,
            bossCount: 2
        }
    },

    // 奖励配置
    rewards: {
        gem10: {
            gold: 100,
            diamonds: 5
        },
        red: {
            diamonds: 5
        }
    },

    // 动画配置
    animation: {
        moveStepDelay: 300,     // 移动步骤延迟
        victoryModalDelay: 2500, // 胜利模态框显示时间
        upgradeTipDuration: 1000,// 升级提示显示时间
        lightningInterval: 2000, // 雷电攻击间隔
        damageNumberDuration: 1000 // 伤害数字显示时间
    },

    // 雷电技能配置
    lightning: {
        maxCharges: 5,          // 最大充能次数
        normalKillPercent: 0.15, // 未击中时随机击杀怪物百分比
        bossDamage: 5,          // 对BOSS造成的伤害
        size: 100                // 雷电效果大小
    }
}; 