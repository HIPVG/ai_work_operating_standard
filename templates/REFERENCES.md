# 参考文献台帳 — 50文書テンプレート集 v0.5

改訂履歴: 2026-09-26 初版／v0.5 運用標準とのクロスチェックを反映
状態: 出典と利用範囲の記録／任意採用TIPS
対象: 本テンプレート集の共通設計・固有欄・作例
適用例: 書式の選定、出典の再確認、顧客帳票への観点の取り込み

[一覧](README.md) | [共通設計](DESIGN.md)

## 内部の正本

- [運用標準 v1.0](../01-ai_work_operating_standard_integrated_v1_0_2026-09.md)：規範。特に3.1・3.6、G0〜G9、6.12、7、9.1〜9.3を対応付けた。本集から変更していない。
- [必要十分性スタディ](../02-ai_artifact_sufficiency_study_v0_1_2026-09.md)：TIPS。50件の名称、規模別参考度、適用トリガー、標準対応先を継承した。現行版はリンク先の管理ヘッダを参照。

## 外部一次資料

以下21件のリンク先を2026-09-26に開き、関連する本文を確認した。サイト全体・有料規格本文・リンク先添付ファイル一式を検査したという意味ではない。「書式」以外にも仕様、工程ガイド、チェックリストが含まれる。

表の`種別`は資料の性格（`source_kind`）、`この集への利用範囲`は本集で参照した観点と非規範性（`normative_status_and_use`）を示す。外部資料はすべて参考であり、本リポジトリの規範ではない。資料ごとの確認範囲（`review_scope`）は、表の名称・確認日と末尾の「確認の限界と利用条件」を組み合わせて読む。

スタディの参考文献のうち、Discovery、NIST Playbook、ATRS、Microsoftの影響評価、Googleの監視資料を引き続き使い、それ以外に書式・記入観点を補う資料を追加した。スタディに載る他の文献を再検証済みと扱わない。

| ID | 一次資料・確認した媒体 | 種別 (`source_kind`) | この集への利用範囲 (`normative_status_and_use`) | 利用先 |
|---|---|---|---|---|
| S01 | [Atlassian Project Charter](https://www.atlassian.com/software/confluence/templates/project-charter) | 書式解説 | 目的・責任・範囲の入口。軽量PoCに憲章を強制する根拠にはしない。 | [T01](a-planning/T01-project-charter.md)、[T04](a-planning/T04-roles.md)、[T09](a-planning/T09-communication.md) |
| S02 | [Atlassian Product Requirements](https://www.atlassian.com/software/confluence/templates/product-requirements) | 書式解説 | 要求と目的、未解決の問い、対象外を対応付ける。 | [T02](a-planning/T02-product-vision.md)、[T05](a-planning/T05-scope.md)、[T08](a-planning/T08-assumptions.md)、[T17](b-discovery-requirements/T17-requirements.md)、[T18](b-discovery-requirements/T18-backlog.md)、[T38](d-delivery-operations/T38-user-acceptance.md) |
| S03 | [GOV.UK Discovery](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works) | 工程ガイド | 解決すべき問題、制約、次段階の判断に利用。 | [T02](a-planning/T02-product-vision.md)、[T11](b-discovery-requirements/T11-problem-definition.md)、[T12](b-discovery-requirements/T12-research-report.md)、[T15](b-discovery-requirements/T15-service-journey.md)、[T16](b-discovery-requirements/T16-current-state.md) |
| S04 | [GOV.UK Plan user research](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service) | 工程ガイド | 調査の問いと対象利用者、計画の共有を参照。 | [T13](b-discovery-requirements/T13-user-research-plan.md) |
| S05 | [GOV.UK Analyse a research session](https://www.gov.uk/service-manual/user-research/analyse-a-research-session) | 分析ガイド | 観察と解釈を区別する作例に利用。 | [T14](b-discovery-requirements/T14-user-research-findings.md)、[T15](b-discovery-requirements/T15-service-journey.md) |
| S06 | [GOV.UK Measuring service benefits](https://www.gov.uk/service-manual/measuring-success/measuring-service-benefits) | 工程ガイド | 期待便益と運用後の測定のつながりを参照。 | [T03](a-planning/T03-business-case.md)、[T06](a-planning/T06-roadmap.md)、[T10](a-planning/T10-benefits.md) |
| S07 | [arc42 Template Overview](https://arc42.org/overview/) | 設計文書構成 | 構造・実行時・配置・品質・リスクの観点を参照。原テンプレートの翻訳・複製ではない。 | [T16](b-discovery-requirements/T16-current-state.md)、[T19](b-discovery-requirements/T19-nonfunctional.md)、[T23](c-design-risk/T23-context.md)、[T24](c-design-risk/T24-architecture.md)、[T25](c-design-risk/T25-data-model.md)、[T29](c-design-risk/T29-quality-risk.md)、[T31](c-design-risk/T31-design-review.md) |
| S08 | [Markdown Architectural Decision Records](https://adr.github.io/madr/) | 書式・作例 | 一つの判断の理由、選択肢、帰結を残す構成を参考にした。 | [T07](a-planning/T07-raid.md)、[T21](c-design-risk/T21-options.md)、[T22](c-design-risk/T22-adr.md)、[T31](c-design-risk/T31-design-review.md)、[T34](d-delivery-operations/T34-change-request.md) |
| S09 | [OpenAPI Specification 3.1.1](https://spec.openapis.org/oas/v3.1.1.html) | 仕様 | 入出力、エラー、認証を契約として記述する観点。採用版を強制しない。 | [T25](c-design-risk/T25-data-model.md)、[T26](c-design-risk/T26-interface-contract.md) |
| S10 | [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) | 設計ガイド | 対象、脅威、対策、確認の関連付け。 | [T27](c-design-risk/T27-threat-model.md)、[T29](c-design-risk/T29-quality-risk.md)、[T48](e-ai/T48-adversarial-test.md) |
| S11 | [ICO Annex D DPIA template](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/annex-d-dpia-template/) | 書式紹介 | データ処理と影響・対応の構造を参照。英国の特定分野の資料であり、日本の法的適合や実施義務の根拠にはしない。 | [T28](c-design-risk/T28-privacy-impact.md) |
| S12 | [Microsoft Azure Test Plans](https://learn.microsoft.com/en-us/azure/devops/test/create-a-test-plan?view=azure-devops) | 製品ガイド | 計画、テスト群、ケース、要求の関連付け。製品導入は前提にしない。 | [T20](b-discovery-requirements/T20-traceability.md)、[T30](d-delivery-operations/T30-test-strategy.md)、[T32](d-delivery-operations/T32-implementation-plan.md)、[T36](d-delivery-operations/T36-test-plan.md)、[T37](d-delivery-operations/T37-test-results.md)、[T38](d-delivery-operations/T38-user-acceptance.md) |
| S13 | [Google Code Review](https://google.github.io/eng-practices/review/reviewer/looking-for.html) | レビューガイド | 設計・動作・試験・過剰設計の確認観点。 | [T35](d-delivery-operations/T35-code-review.md) |
| S14 | [Google SRE Launch Coordination Checklist](https://sre.google/sre-book/launch-checklist/) | チェックリスト | 導入時に確認する運用条件の候補。全項目の採用は要求しない。 | [T39](d-delivery-operations/T39-release-readiness.md)、[T40](d-delivery-operations/T40-deployment-runbook.md) |
| S15 | [Google SRE Postmortem Culture](https://sre.google/workbook/postmortem-culture/) | 作例・ガイド | 影響、時系列、原因、改善責任を残す観点。 | [T33](d-delivery-operations/T33-status-report.md)、[T40](d-delivery-operations/T40-deployment-runbook.md)、[T50](e-ai/T50-ai-operations.md) |
| S16 | [NIST AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/) | 任意の実践ガイド | 必要な観点を選ぶ運用と、AIリスクを工程横断で扱う構成。固定のゲート列ではない。 | [T41](e-ai/T41-ai-use-case.md)、[T42](e-ai/T42-ai-impact.md)、[T47](e-ai/T47-ai-evaluation.md) |
| S17 | [UK Algorithmic Transparency Recording Standard](https://www.gov.uk/government/publications/algorithmic-transparency-template) | 公開書式案内 | 一般向け要約と詳細情報を分ける構成。添付表の全セル検査はしていない。 | [T41](e-ai/T41-ai-use-case.md)、[T46](e-ai/T46-system-card.md) |
| S18 | [Microsoft AI Agent Impact Assessment](https://github.com/microsoft/agent-governance-toolkit/blob/main/docs/compliance/impact-assessment-template.md) | リポジトリの書式 | エージェントの用途、影響対象、人の監督の記入観点。法令適合の自己説明は援用しない。 | [T42](e-ai/T42-ai-impact.md)、[T46](e-ai/T46-system-card.md)、[T48](e-ai/T48-adversarial-test.md)、[T49](e-ai/T49-human-oversight.md) |
| S19 | [Hugging Face Dataset Cards](https://huggingface.co/docs/hub/datasets-cards) | 書式解説 | データの内容、用途、偏り、利用条件を説明する観点。 | [T43](e-ai/T43-data-card.md) |
| S20 | [Hugging Face Annotated Model Card](https://huggingface.co/docs/hub/model-card-annotated) | 注釈付き書式 | モデルの用途・限界と評価条件の記録。 | [T45](e-ai/T45-model-card.md)、[T47](e-ai/T47-ai-evaluation.md) |
| S21 | [Google ML Monitoring pipelines](https://developers.google.com/machine-learning/crash-course/production-ml-systems/monitoring) | 運用ガイド | 入力品質と変換後品質を別々に確かめる観点。 | [T44](e-ai/T44-data-validation.md)、[T50](e-ai/T50-ai-operations.md) |

## 確認の限界と利用条件

- S01・S02は提供元の公開説明ページを確認した。Confluenceへのログイン、テンプレートの複製、製品の導入は行っていない。
- S07は構成概要、S08はMADRの説明・構成例を参照した。原テンプレートの翻訳・転載ではなく、問いと作例は独自に記述した。
- S09は版を固定した3.1.1の公開仕様を確認した。最新版の推奨や、案件で採用すべき版の決定ではない。
- S11は特定の英国制度・分野に属するDPIA書式の案内ページを確認した。添付書式の全項目確認、日本を含む各法域の適用判断・法的適合の確認はしていない。
- S12はAzure Test Plansの計画・ケース管理の説明を参照した。T32では作業と検証の接続の参考に限り、実装計画の公式標準として扱わない。
- S15は事後記録・改善のガイドである。T33では状態・事実・次の対応を分離するための補助に限り、進捗報告書の提供元テンプレートとは称さない。
- S16は任意に選択する実践ガイドの公開ページを確認した。改訂中の案内があり、今後の利用時は版・更新状況を確認する。全アクションを追加ゲートにしない。
- S17は公表ページを確認した。添付表の全セルを読み込んだり、最新の添付版と本集の全欄を一対一照合したりはしていない。
- S18はGitHub上の対象Markdown本文を確認した。mainブランチは可変であり、原文の法令分類・遵守の主張は採用していない。外部リポジトリの動作や制御を検証したわけではない。
- S19・S20はカードの説明と注釈付き構成を参照した。モデル供給者の情報を利用側で再検証済みとする根拠にはしない。
- 各出典の利用先は「観点を参照した場所」であり、当該出典がその書式全体を規定していることを意味しない。例えばT07のRAID全体をS08が定義しているわけではない。
- 参考文献を参照することと、書式の採用、追加の調査・実行の許可は別である。実案件で原書式そのものを複製・翻訳・配布する場合は、その提供条件を別途確認する。

本集の本文・作例に、出典の長文転載、原書式の添付又は提供元の適合認証を含めていない。確認日以降の変更はこの記録だけでは保証しない。
