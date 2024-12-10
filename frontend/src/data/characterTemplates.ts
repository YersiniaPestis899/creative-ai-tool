export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export const characterTemplates: CharacterTemplate[] = [
  {
    id: 'fantasy-hero',
    name: 'ファンタジー主人公',
    description: '魔法や剣術を駆使する勇敢な主人公',
    template: `
主人公の設定:
- 年齢: 16-25歳の若者
- 特殊能力: 魔法や剣術の才能
- 背景: 平和な村の出身で、何らかの事件をきっかけに冒険に出る
- 性格: 正義感が強く、仲間思い
- 特徴的な外見的特徴
- 克服すべき弱点や課題
`,
  },
  {
    id: 'mystery-detective',
    name: '探偵キャラクター',
    description: '鋭い洞察力を持つミステリーの探偵',
    template: `
探偵キャラクターの設定:
- 年齢: 30-45歳
- 特技: 観察眼、推理力
- 経歴: 警察か私立探偵としての経験
- 性格: 冷静、論理的
- トレードマークとなる外見や癖
- 過去のトラウマや未解決事件
`,
  },
  {
    id: 'scifi-scientist',
    name: 'SF研究者',
    description: '革新的な発明や発見を行う科学者',
    template: `
研究者キャラクターの設定:
- 年齢: 35-50歳
- 専門分野: 最先端科学技術
- 所属: 研究機関や企業
- 性格: 好奇心旺盛、やや変わり者
- 研究テーマと目標
- 科学への情熱の源となる過去の出来事
`,
  },
  {
    id: 'slice-of-life',
    name: '日常系キャラクター',
    description: '親しみやすい一般的な登場人物',
    template: `
日常系キャラクターの設定:
- 年齢: 学生か若手社会人
- 職業/学年: 具体的な所属
- 家族構成: 家族関係
- 性格: 明るさと悩みのバランス
- 日常的な趣味や特技
- 将来の夢や目標
`,
  },
];

export const getTemplateById = (id: string): CharacterTemplate | undefined => {
  return characterTemplates.find(template => template.id === id);
};