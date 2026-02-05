-- ⚠️ DEV/MAINTENANCE ONLY
-- 중복 teams를 통합하기 위한 일회성 데이터 정리 스크립트입니다.
-- 운영 환경에서 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

BEGIN;
-- 중복 팀 통합 작업 (개선 버전)
-- 생성일: 2026-02-05T05:31:37.347Z
-- 총 69개 그룹, 69개 팀 통합

-- U11 1조: 리틀코리아FC U12 → 인천리틀코리아FCU12
UPDATE matches SET home_team_id = 'a8713945-87e1-443c-ab02-fa94fca4b2c2' WHERE home_team_id = '0e14774f-a83e-4ebe-bae2-23bb52845851';
UPDATE matches SET away_team_id = 'a8713945-87e1-443c-ab02-fa94fca4b2c2' WHERE away_team_id = '0e14774f-a83e-4ebe-bae2-23bb52845851';
UPDATE fair_play_points SET team_id = 'a8713945-87e1-443c-ab02-fa94fca4b2c2' WHERE team_id = '0e14774f-a83e-4ebe-bae2-23bb52845851';
DELETE FROM teams WHERE id = '0e14774f-a83e-4ebe-bae2-23bb52845851';

-- U11 1조: 일산JFC U12 → 경기일산JFCU12
UPDATE matches SET home_team_id = 'd31cd2b0-ed62-4268-9156-d21e70dac6fe' WHERE home_team_id = 'b403cc0b-d3a2-4ea0-865c-9a118e348fd4';
UPDATE matches SET away_team_id = 'd31cd2b0-ed62-4268-9156-d21e70dac6fe' WHERE away_team_id = 'b403cc0b-d3a2-4ea0-865c-9a118e348fd4';
UPDATE fair_play_points SET team_id = 'd31cd2b0-ed62-4268-9156-d21e70dac6fe' WHERE team_id = 'b403cc0b-d3a2-4ea0-865c-9a118e348fd4';
DELETE FROM teams WHERE id = 'b403cc0b-d3a2-4ea0-865c-9a118e348fd4';

-- U11 1조: K리거강용FC B → 서울K리거강용FCB
UPDATE matches SET home_team_id = 'a30b7eaf-2834-45b2-834c-1416ccf83771' WHERE home_team_id = 'ec909ee8-d44e-4cfe-8959-bb832cee84f6';
UPDATE matches SET away_team_id = 'a30b7eaf-2834-45b2-834c-1416ccf83771' WHERE away_team_id = 'ec909ee8-d44e-4cfe-8959-bb832cee84f6';
UPDATE fair_play_points SET team_id = 'a30b7eaf-2834-45b2-834c-1416ccf83771' WHERE team_id = 'ec909ee8-d44e-4cfe-8959-bb832cee84f6';
DELETE FROM teams WHERE id = 'ec909ee8-d44e-4cfe-8959-bb832cee84f6';

-- U11 2조: 계양구유소년 U12 → 인천계양구유소년U12
UPDATE matches SET home_team_id = 'a5a0fb05-d2a1-4018-ac6f-ee713309a344' WHERE home_team_id = 'cc812124-48d7-4146-80d6-0ba22a3d9d27';
UPDATE matches SET away_team_id = 'a5a0fb05-d2a1-4018-ac6f-ee713309a344' WHERE away_team_id = 'cc812124-48d7-4146-80d6-0ba22a3d9d27';
UPDATE fair_play_points SET team_id = 'a5a0fb05-d2a1-4018-ac6f-ee713309a344' WHERE team_id = 'cc812124-48d7-4146-80d6-0ba22a3d9d27';
DELETE FROM teams WHERE id = 'cc812124-48d7-4146-80d6-0ba22a3d9d27';

-- U11 3조: 인유서구 U12 → 인천인유서구U12
UPDATE matches SET home_team_id = 'd76bd541-e7db-431a-9c5d-e2fe0ec818f5' WHERE home_team_id = '3376f7b2-a08a-40ad-9122-1cd07807a554';
UPDATE matches SET away_team_id = 'd76bd541-e7db-431a-9c5d-e2fe0ec818f5' WHERE away_team_id = '3376f7b2-a08a-40ad-9122-1cd07807a554';
UPDATE fair_play_points SET team_id = 'd76bd541-e7db-431a-9c5d-e2fe0ec818f5' WHERE team_id = '3376f7b2-a08a-40ad-9122-1cd07807a554';
DELETE FROM teams WHERE id = '3376f7b2-a08a-40ad-9122-1cd07807a554';

-- U11 3조: 연세FC U12 → 경기연세FCU12
UPDATE matches SET home_team_id = '6ae2a379-f081-46f1-bb2d-0c2aedae480f' WHERE home_team_id = '21d716dd-74d6-4a76-89c9-a87084bb437a';
UPDATE matches SET away_team_id = '6ae2a379-f081-46f1-bb2d-0c2aedae480f' WHERE away_team_id = '21d716dd-74d6-4a76-89c9-a87084bb437a';
UPDATE fair_play_points SET team_id = '6ae2a379-f081-46f1-bb2d-0c2aedae480f' WHERE team_id = '21d716dd-74d6-4a76-89c9-a87084bb437a';
DELETE FROM teams WHERE id = '21d716dd-74d6-4a76-89c9-a87084bb437a';

-- U11 3조: 화랑 U12 → 서울화랑U12
UPDATE matches SET home_team_id = '79e43a11-93b0-470e-8a97-588cddb74768' WHERE home_team_id = '42b64e4f-fe3a-476c-a2ab-3a7defb00dde';
UPDATE matches SET away_team_id = '79e43a11-93b0-470e-8a97-588cddb74768' WHERE away_team_id = '42b64e4f-fe3a-476c-a2ab-3a7defb00dde';
UPDATE fair_play_points SET team_id = '79e43a11-93b0-470e-8a97-588cddb74768' WHERE team_id = '42b64e4f-fe3a-476c-a2ab-3a7defb00dde';
DELETE FROM teams WHERE id = '42b64e4f-fe3a-476c-a2ab-3a7defb00dde';

-- U11 4조: 축구의신 U12 → 인천축구의신U12
UPDATE matches SET home_team_id = 'e4f0ead2-ed7d-46a0-9caf-c30799905ce3' WHERE home_team_id = 'f8a30e4d-c477-46fe-9868-f94b26343b75';
UPDATE matches SET away_team_id = 'e4f0ead2-ed7d-46a0-9caf-c30799905ce3' WHERE away_team_id = 'f8a30e4d-c477-46fe-9868-f94b26343b75';
UPDATE fair_play_points SET team_id = 'e4f0ead2-ed7d-46a0-9caf-c30799905ce3' WHERE team_id = 'f8a30e4d-c477-46fe-9868-f94b26343b75';
DELETE FROM teams WHERE id = 'f8a30e4d-c477-46fe-9868-f94b26343b75';

-- U11 4조: TEAM6 FC → 경기TEAM6FC
UPDATE matches SET home_team_id = 'b57e94b1-65e1-4f1b-a986-7eeb603b8bb9' WHERE home_team_id = 'a6de1440-f598-4b63-926f-0ed166e0cd4d';
UPDATE matches SET away_team_id = 'b57e94b1-65e1-4f1b-a986-7eeb603b8bb9' WHERE away_team_id = 'a6de1440-f598-4b63-926f-0ed166e0cd4d';
UPDATE fair_play_points SET team_id = 'b57e94b1-65e1-4f1b-a986-7eeb603b8bb9' WHERE team_id = 'a6de1440-f598-4b63-926f-0ed166e0cd4d';
DELETE FROM teams WHERE id = 'a6de1440-f598-4b63-926f-0ed166e0cd4d';

-- U11 4조: 관악FC U12 → 서울관악FCU12
UPDATE matches SET home_team_id = '1a16ae22-8893-4bb7-bf37-8e22619e8f8b' WHERE home_team_id = 'a6908377-a3dd-47ef-8908-3c7dad50577f';
UPDATE matches SET away_team_id = '1a16ae22-8893-4bb7-bf37-8e22619e8f8b' WHERE away_team_id = 'a6908377-a3dd-47ef-8908-3c7dad50577f';
UPDATE fair_play_points SET team_id = '1a16ae22-8893-4bb7-bf37-8e22619e8f8b' WHERE team_id = 'a6908377-a3dd-47ef-8908-3c7dad50577f';
DELETE FROM teams WHERE id = 'a6908377-a3dd-47ef-8908-3c7dad50577f';

-- U11 5조: 남양산FC U12 → 경남남양산FCU12
UPDATE matches SET home_team_id = '298e9a62-20be-4bae-909c-34d7fffb57d0' WHERE home_team_id = 'f898d904-c7f2-415f-b3e7-ac44a97cd1c4';
UPDATE matches SET away_team_id = '298e9a62-20be-4bae-909c-34d7fffb57d0' WHERE away_team_id = 'f898d904-c7f2-415f-b3e7-ac44a97cd1c4';
UPDATE fair_play_points SET team_id = '298e9a62-20be-4bae-909c-34d7fffb57d0' WHERE team_id = 'f898d904-c7f2-415f-b3e7-ac44a97cd1c4';
DELETE FROM teams WHERE id = 'f898d904-c7f2-415f-b3e7-ac44a97cd1c4';

-- U11 5조: 월드컵FC U12 → 경기월드컵FCU12
UPDATE matches SET home_team_id = 'b10e40e1-e8ed-4c98-8fb3-5ad17e3a3c8b' WHERE home_team_id = '5e9243b5-301f-45f5-9266-b419e8e7afbc';
UPDATE matches SET away_team_id = 'b10e40e1-e8ed-4c98-8fb3-5ad17e3a3c8b' WHERE away_team_id = '5e9243b5-301f-45f5-9266-b419e8e7afbc';
UPDATE fair_play_points SET team_id = 'b10e40e1-e8ed-4c98-8fb3-5ad17e3a3c8b' WHERE team_id = '5e9243b5-301f-45f5-9266-b419e8e7afbc';
DELETE FROM teams WHERE id = '5e9243b5-301f-45f5-9266-b419e8e7afbc';

-- U11 5조: 제주SK U12 → 제주SKU12
UPDATE matches SET home_team_id = '888e7e0f-4360-467a-b883-c706e41f09db' WHERE home_team_id = 'aa9b0b34-fa1f-4f45-96c3-31c71bf1acfd';
UPDATE matches SET away_team_id = '888e7e0f-4360-467a-b883-c706e41f09db' WHERE away_team_id = 'aa9b0b34-fa1f-4f45-96c3-31c71bf1acfd';
UPDATE fair_play_points SET team_id = '888e7e0f-4360-467a-b883-c706e41f09db' WHERE team_id = 'aa9b0b34-fa1f-4f45-96c3-31c71bf1acfd';
DELETE FROM teams WHERE id = 'aa9b0b34-fa1f-4f45-96c3-31c71bf1acfd';

-- U11 6조: 용인대YFC U12 → 경기용인대YFCU12
UPDATE matches SET home_team_id = '31b08a19-35b4-49e1-b3a5-cd16289c94ac' WHERE home_team_id = 'fb9ddad7-0e05-475c-9b01-483672d80f74';
UPDATE matches SET away_team_id = '31b08a19-35b4-49e1-b3a5-cd16289c94ac' WHERE away_team_id = 'fb9ddad7-0e05-475c-9b01-483672d80f74';
UPDATE fair_play_points SET team_id = '31b08a19-35b4-49e1-b3a5-cd16289c94ac' WHERE team_id = 'fb9ddad7-0e05-475c-9b01-483672d80f74';
DELETE FROM teams WHERE id = 'fb9ddad7-0e05-475c-9b01-483672d80f74';

-- U11 7조: 위례FC U12 → 서울위례FCU12
UPDATE matches SET home_team_id = 'ad908a0c-a309-4573-a861-193d4a579b69' WHERE home_team_id = '59d7d9cb-b645-443c-bfa8-1c793f5fec67';
UPDATE matches SET away_team_id = 'ad908a0c-a309-4573-a861-193d4a579b69' WHERE away_team_id = '59d7d9cb-b645-443c-bfa8-1c793f5fec67';
UPDATE fair_play_points SET team_id = 'ad908a0c-a309-4573-a861-193d4a579b69' WHERE team_id = '59d7d9cb-b645-443c-bfa8-1c793f5fec67';
DELETE FROM teams WHERE id = '59d7d9cb-b645-443c-bfa8-1c793f5fec67';

-- U11 8조: FCMJ 풋볼아카데미 → 부산FCMJ풋볼아카데미
UPDATE matches SET home_team_id = '97397b37-113e-4b83-88a8-7b4603e4d4c1' WHERE home_team_id = '76b32fa7-0b90-456b-a57a-2d75e367c4ce';
UPDATE matches SET away_team_id = '97397b37-113e-4b83-88a8-7b4603e4d4c1' WHERE away_team_id = '76b32fa7-0b90-456b-a57a-2d75e367c4ce';
UPDATE fair_play_points SET team_id = '97397b37-113e-4b83-88a8-7b4603e4d4c1' WHERE team_id = '76b32fa7-0b90-456b-a57a-2d75e367c4ce';
DELETE FROM teams WHERE id = '76b32fa7-0b90-456b-a57a-2d75e367c4ce';

-- U11 8조: 신답FC U12 그린 → 서울신답FCU12그린
UPDATE matches SET home_team_id = '12df77d1-6ac9-473e-8e7b-ef514b68f975' WHERE home_team_id = '79472143-d7de-4c4f-919f-5edc78099cc9';
UPDATE matches SET away_team_id = '12df77d1-6ac9-473e-8e7b-ef514b68f975' WHERE away_team_id = '79472143-d7de-4c4f-919f-5edc78099cc9';
UPDATE fair_play_points SET team_id = '12df77d1-6ac9-473e-8e7b-ef514b68f975' WHERE team_id = '79472143-d7de-4c4f-919f-5edc78099cc9';
DELETE FROM teams WHERE id = '79472143-d7de-4c4f-919f-5edc78099cc9';

-- U11 8조: 프로FC U12 → 제주프로FCU12
UPDATE matches SET home_team_id = '6348bbde-1485-4253-8a09-07345cdaab8b' WHERE home_team_id = 'f06999df-372f-4ccc-ac9f-11a3ad9b4cfc';
UPDATE matches SET away_team_id = '6348bbde-1485-4253-8a09-07345cdaab8b' WHERE away_team_id = 'f06999df-372f-4ccc-ac9f-11a3ad9b4cfc';
UPDATE fair_play_points SET team_id = '6348bbde-1485-4253-8a09-07345cdaab8b' WHERE team_id = 'f06999df-372f-4ccc-ac9f-11a3ad9b4cfc';
DELETE FROM teams WHERE id = 'f06999df-372f-4ccc-ac9f-11a3ad9b4cfc';

-- U11 9조: 연산SC U12 B → 부산연산SCU12B
UPDATE matches SET home_team_id = '422a78fa-896b-4860-8f5c-1ff6edfc3b19' WHERE home_team_id = 'dd049cfb-480f-4574-b7ca-ddfb84702f1c';
UPDATE matches SET away_team_id = '422a78fa-896b-4860-8f5c-1ff6edfc3b19' WHERE away_team_id = 'dd049cfb-480f-4574-b7ca-ddfb84702f1c';
UPDATE fair_play_points SET team_id = '422a78fa-896b-4860-8f5c-1ff6edfc3b19' WHERE team_id = 'dd049cfb-480f-4574-b7ca-ddfb84702f1c';
DELETE FROM teams WHERE id = 'dd049cfb-480f-4574-b7ca-ddfb84702f1c';

-- U11 9조: 안양AFA U12 → 경기안양AFAU12
UPDATE matches SET home_team_id = 'd706238a-aa3d-4875-ab68-fd4387dca260' WHERE home_team_id = '2860fd85-3181-46e7-82a8-05ec2e8288c1';
UPDATE matches SET away_team_id = 'd706238a-aa3d-4875-ab68-fd4387dca260' WHERE away_team_id = '2860fd85-3181-46e7-82a8-05ec2e8288c1';
UPDATE fair_play_points SET team_id = 'd706238a-aa3d-4875-ab68-fd4387dca260' WHERE team_id = '2860fd85-3181-46e7-82a8-05ec2e8288c1';
DELETE FROM teams WHERE id = '2860fd85-3181-46e7-82a8-05ec2e8288c1';

-- U11 9조: 신답FC U12 화이트 → 서울신답FCU12화이트
UPDATE matches SET home_team_id = '01229f87-8173-493d-aa76-44c4571e7747' WHERE home_team_id = '8b4c7158-6db0-42ec-9293-be89385641fc';
UPDATE matches SET away_team_id = '01229f87-8173-493d-aa76-44c4571e7747' WHERE away_team_id = '8b4c7158-6db0-42ec-9293-be89385641fc';
UPDATE fair_play_points SET team_id = '01229f87-8173-493d-aa76-44c4571e7747' WHERE team_id = '8b4c7158-6db0-42ec-9293-be89385641fc';
DELETE FROM teams WHERE id = '8b4c7158-6db0-42ec-9293-be89385641fc';

-- U11 10조: 연산SC U12 A → 부산연산SCU12A
UPDATE matches SET home_team_id = 'ce3ea0ca-c33d-4aad-af15-d0e53175c019' WHERE home_team_id = '4b630142-f4d4-4b50-b331-627f78aa6ff3';
UPDATE matches SET away_team_id = 'ce3ea0ca-c33d-4aad-af15-d0e53175c019' WHERE away_team_id = '4b630142-f4d4-4b50-b331-627f78aa6ff3';
UPDATE fair_play_points SET team_id = 'ce3ea0ca-c33d-4aad-af15-d0e53175c019' WHERE team_id = '4b630142-f4d4-4b50-b331-627f78aa6ff3';
DELETE FROM teams WHERE id = '4b630142-f4d4-4b50-b331-627f78aa6ff3';

-- U11 10조: 화성시 U12 → 경기화성시U12
UPDATE matches SET home_team_id = 'd98cbeaa-226b-4e66-b211-586375fec09a' WHERE home_team_id = 'b3b2575b-341f-4c13-b84b-b1c4abb0c6d6';
UPDATE matches SET away_team_id = 'd98cbeaa-226b-4e66-b211-586375fec09a' WHERE away_team_id = 'b3b2575b-341f-4c13-b84b-b1c4abb0c6d6';
UPDATE fair_play_points SET team_id = 'd98cbeaa-226b-4e66-b211-586375fec09a' WHERE team_id = 'b3b2575b-341f-4c13-b84b-b1c4abb0c6d6';
DELETE FROM teams WHERE id = 'b3b2575b-341f-4c13-b84b-b1c4abb0c6d6';

-- U11 10조: FC구로 U12 → 서울FC구로U12
UPDATE matches SET home_team_id = 'b7b13975-2c5d-4572-9587-a3e36d378c63' WHERE home_team_id = 'bfa15d7f-eb2b-4666-a964-10785918187a';
UPDATE matches SET away_team_id = 'b7b13975-2c5d-4572-9587-a3e36d378c63' WHERE away_team_id = 'bfa15d7f-eb2b-4666-a964-10785918187a';
UPDATE fair_play_points SET team_id = 'b7b13975-2c5d-4572-9587-a3e36d378c63' WHERE team_id = 'bfa15d7f-eb2b-4666-a964-10785918187a';
DELETE FROM teams WHERE id = 'bfa15d7f-eb2b-4666-a964-10785918187a';

-- U11 11조: 성남시티FC U12 → 경기성남시티FCU12
UPDATE matches SET home_team_id = '3a06ad2b-f066-45cc-9a8c-ddcd2b4341ad' WHERE home_team_id = '8661626b-e261-4be0-898f-b3a920b109fc';
UPDATE matches SET away_team_id = '3a06ad2b-f066-45cc-9a8c-ddcd2b4341ad' WHERE away_team_id = '8661626b-e261-4be0-898f-b3a920b109fc';
UPDATE fair_play_points SET team_id = '3a06ad2b-f066-45cc-9a8c-ddcd2b4341ad' WHERE team_id = '8661626b-e261-4be0-898f-b3a920b109fc';
DELETE FROM teams WHERE id = '8661626b-e261-4be0-898f-b3a920b109fc';

-- U11 12조: SSJFC U12 → 경기SSJFCU12
UPDATE matches SET home_team_id = 'f96d548c-8e8c-4493-a8e3-b868d716412b' WHERE home_team_id = 'ebf17555-0840-48dc-bca2-e68e4f6f34d8';
UPDATE matches SET away_team_id = 'f96d548c-8e8c-4493-a8e3-b868d716412b' WHERE away_team_id = 'ebf17555-0840-48dc-bca2-e68e4f6f34d8';
UPDATE fair_play_points SET team_id = 'f96d548c-8e8c-4493-a8e3-b868d716412b' WHERE team_id = 'ebf17555-0840-48dc-bca2-e68e4f6f34d8';
DELETE FROM teams WHERE id = 'ebf17555-0840-48dc-bca2-e68e4f6f34d8';

-- U11 13조: 청주CTS U12 → 충북청주CTSU12
UPDATE matches SET home_team_id = 'fd6af8ec-4059-4124-9ad8-7c0d84b8eecc' WHERE home_team_id = '74502c0b-6242-4af3-9975-975800b063ff';
UPDATE matches SET away_team_id = 'fd6af8ec-4059-4124-9ad8-7c0d84b8eecc' WHERE away_team_id = '74502c0b-6242-4af3-9975-975800b063ff';
UPDATE fair_play_points SET team_id = 'fd6af8ec-4059-4124-9ad8-7c0d84b8eecc' WHERE team_id = '74502c0b-6242-4af3-9975-975800b063ff';
DELETE FROM teams WHERE id = '74502c0b-6242-4af3-9975-975800b063ff';

-- U11 13조: 서창FC U12 → 인천서창FCU12
UPDATE matches SET home_team_id = 'dce33ffe-8afd-4404-ab60-ed1496f8211b' WHERE home_team_id = 'd063ed9e-1d8d-4539-b0c2-750657d88d12';
UPDATE matches SET away_team_id = 'dce33ffe-8afd-4404-ab60-ed1496f8211b' WHERE away_team_id = 'd063ed9e-1d8d-4539-b0c2-750657d88d12';
UPDATE fair_play_points SET team_id = 'dce33ffe-8afd-4404-ab60-ed1496f8211b' WHERE team_id = 'd063ed9e-1d8d-4539-b0c2-750657d88d12';
DELETE FROM teams WHERE id = 'd063ed9e-1d8d-4539-b0c2-750657d88d12';

-- U11 13조: K리거강용FC A → 서울K리거강용FCA
UPDATE matches SET home_team_id = 'd2e67a8a-8af2-4bbd-b9de-dcfe7e135528' WHERE home_team_id = '3871c6a4-2d83-4782-813d-b5bc07418541';
UPDATE matches SET away_team_id = 'd2e67a8a-8af2-4bbd-b9de-dcfe7e135528' WHERE away_team_id = '3871c6a4-2d83-4782-813d-b5bc07418541';
UPDATE fair_play_points SET team_id = 'd2e67a8a-8af2-4bbd-b9de-dcfe7e135528' WHERE team_id = '3871c6a4-2d83-4782-813d-b5bc07418541';
DELETE FROM teams WHERE id = '3871c6a4-2d83-4782-813d-b5bc07418541';

-- U11 14조: JK풋볼 U12 → 광주JK풋볼U12
UPDATE matches SET home_team_id = '606c42d5-d627-4e1a-aca1-e69571acb5e5' WHERE home_team_id = '51b3c063-ab4a-492a-a5b5-a0f34cb566c9';
UPDATE matches SET away_team_id = '606c42d5-d627-4e1a-aca1-e69571acb5e5' WHERE away_team_id = '51b3c063-ab4a-492a-a5b5-a0f34cb566c9';
UPDATE fair_play_points SET team_id = '606c42d5-d627-4e1a-aca1-e69571acb5e5' WHERE team_id = '51b3c063-ab4a-492a-a5b5-a0f34cb566c9';
DELETE FROM teams WHERE id = '51b3c063-ab4a-492a-a5b5-a0f34cb566c9';

-- U11 14조: AAFC U12 → 서울AAFCU12
UPDATE matches SET home_team_id = '067c325f-cecf-4c83-b140-706fcc801a8f' WHERE home_team_id = 'ff13b974-7e1c-45ff-9d57-8657cd17e492';
UPDATE matches SET away_team_id = '067c325f-cecf-4c83-b140-706fcc801a8f' WHERE away_team_id = 'ff13b974-7e1c-45ff-9d57-8657cd17e492';
UPDATE fair_play_points SET team_id = '067c325f-cecf-4c83-b140-706fcc801a8f' WHERE team_id = 'ff13b974-7e1c-45ff-9d57-8657cd17e492';
DELETE FROM teams WHERE id = 'ff13b974-7e1c-45ff-9d57-8657cd17e492';

-- U11 15조: 강릉온리원FC U12 → 강원강릉온리원FCU12
UPDATE matches SET home_team_id = 'deaa83aa-2b41-40a5-a624-bbf11bd4517f' WHERE home_team_id = 'a19031b0-ee5f-4793-a515-81192a63a972';
UPDATE matches SET away_team_id = 'deaa83aa-2b41-40a5-a624-bbf11bd4517f' WHERE away_team_id = 'a19031b0-ee5f-4793-a515-81192a63a972';
UPDATE fair_play_points SET team_id = 'deaa83aa-2b41-40a5-a624-bbf11bd4517f' WHERE team_id = 'a19031b0-ee5f-4793-a515-81192a63a972';
DELETE FROM teams WHERE id = 'a19031b0-ee5f-4793-a515-81192a63a972';

-- U11 15조: YSC U12 → 인천YSCU12
UPDATE matches SET home_team_id = '7ddca932-3ec3-4c77-be86-aee832c6de4f' WHERE home_team_id = 'bcb08598-82f5-4d4d-8df4-54588764387e';
UPDATE matches SET away_team_id = '7ddca932-3ec3-4c77-be86-aee832c6de4f' WHERE away_team_id = 'bcb08598-82f5-4d4d-8df4-54588764387e';
UPDATE fair_play_points SET team_id = '7ddca932-3ec3-4c77-be86-aee832c6de4f' WHERE team_id = 'bcb08598-82f5-4d4d-8df4-54588764387e';
DELETE FROM teams WHERE id = 'bcb08598-82f5-4d4d-8df4-54588764387e';

-- U11 16조: 연수구청 유소년 U12 → 인천연수구청유소년축구단U12
UPDATE matches SET home_team_id = '1fc0c8cf-8cf4-4354-acd6-fa668c430dfc' WHERE home_team_id = '048880d1-5289-4861-b89b-cfd84b1a42af';
UPDATE matches SET away_team_id = '1fc0c8cf-8cf4-4354-acd6-fa668c430dfc' WHERE away_team_id = '048880d1-5289-4861-b89b-cfd84b1a42af';
UPDATE fair_play_points SET team_id = '1fc0c8cf-8cf4-4354-acd6-fa668c430dfc' WHERE team_id = '048880d1-5289-4861-b89b-cfd84b1a42af';
DELETE FROM teams WHERE id = '048880d1-5289-4861-b89b-cfd84b1a42af';

-- U12 1조: 리틀코리아FC U12 → 인천리틀코리아FCU12
UPDATE matches SET home_team_id = '0fa71b1f-bbe8-499e-8bcf-ef77a0feef7a' WHERE home_team_id = 'b90a004a-b07c-4c4c-9378-a5ff5f3348c9';
UPDATE matches SET away_team_id = '0fa71b1f-bbe8-499e-8bcf-ef77a0feef7a' WHERE away_team_id = 'b90a004a-b07c-4c4c-9378-a5ff5f3348c9';
UPDATE fair_play_points SET team_id = '0fa71b1f-bbe8-499e-8bcf-ef77a0feef7a' WHERE team_id = 'b90a004a-b07c-4c4c-9378-a5ff5f3348c9';
DELETE FROM teams WHERE id = 'b90a004a-b07c-4c4c-9378-a5ff5f3348c9';

-- U12 1조: 월드컵FC U12 → 경기월드컵FCU12
UPDATE matches SET home_team_id = 'af2e9d2a-be16-4922-a0ad-df3eda4f0333' WHERE home_team_id = '1f0cf277-eb83-49b8-a1a1-8c77f12f4425';
UPDATE matches SET away_team_id = 'af2e9d2a-be16-4922-a0ad-df3eda4f0333' WHERE away_team_id = '1f0cf277-eb83-49b8-a1a1-8c77f12f4425';
UPDATE fair_play_points SET team_id = 'af2e9d2a-be16-4922-a0ad-df3eda4f0333' WHERE team_id = '1f0cf277-eb83-49b8-a1a1-8c77f12f4425';
DELETE FROM teams WHERE id = '1f0cf277-eb83-49b8-a1a1-8c77f12f4425';

-- U12 2조: 서창FC U12 → 인천서창FCU12
UPDATE matches SET home_team_id = '458be2e3-8ad2-42c0-8729-2677edfad671' WHERE home_team_id = '7695091e-3aa8-4845-a98a-ff5b32b9b5cd';
UPDATE matches SET away_team_id = '458be2e3-8ad2-42c0-8729-2677edfad671' WHERE away_team_id = '7695091e-3aa8-4845-a98a-ff5b32b9b5cd';
UPDATE fair_play_points SET team_id = '458be2e3-8ad2-42c0-8729-2677edfad671' WHERE team_id = '7695091e-3aa8-4845-a98a-ff5b32b9b5cd';
DELETE FROM teams WHERE id = '7695091e-3aa8-4845-a98a-ff5b32b9b5cd';

-- U12 2조: 김포PNCFC U12 → 경기김포PNCFCU12
UPDATE matches SET home_team_id = '4e326547-e07a-4abb-a268-a5a0e757e344' WHERE home_team_id = 'f35b0fcf-61dd-44b4-b6df-65779ef9e59e';
UPDATE matches SET away_team_id = '4e326547-e07a-4abb-a268-a5a0e757e344' WHERE away_team_id = 'f35b0fcf-61dd-44b4-b6df-65779ef9e59e';
UPDATE fair_play_points SET team_id = '4e326547-e07a-4abb-a268-a5a0e757e344' WHERE team_id = 'f35b0fcf-61dd-44b4-b6df-65779ef9e59e';
DELETE FROM teams WHERE id = 'f35b0fcf-61dd-44b4-b6df-65779ef9e59e';

-- U12 2조: FC구로 U12 → 서울FC구로U12
UPDATE matches SET home_team_id = 'c56920b2-c180-4ac8-98ca-e61c17ed9b65' WHERE home_team_id = 'e58291a0-6ffd-4e08-bcac-c9abc19ccb15';
UPDATE matches SET away_team_id = 'c56920b2-c180-4ac8-98ca-e61c17ed9b65' WHERE away_team_id = 'e58291a0-6ffd-4e08-bcac-c9abc19ccb15';
UPDATE fair_play_points SET team_id = 'c56920b2-c180-4ac8-98ca-e61c17ed9b65' WHERE team_id = 'e58291a0-6ffd-4e08-bcac-c9abc19ccb15';
DELETE FROM teams WHERE id = 'e58291a0-6ffd-4e08-bcac-c9abc19ccb15';

-- U12 3조: 축구의신신 U12 → 인천축구의신U12
UPDATE matches SET home_team_id = '21a4b2ee-09d7-43a7-94a2-c01ece7ab1dc' WHERE home_team_id = '63420858-9381-4b2c-930c-7e36d1a9e05d';
UPDATE matches SET away_team_id = '21a4b2ee-09d7-43a7-94a2-c01ece7ab1dc' WHERE away_team_id = '63420858-9381-4b2c-930c-7e36d1a9e05d';
UPDATE fair_play_points SET team_id = '21a4b2ee-09d7-43a7-94a2-c01ece7ab1dc' WHERE team_id = '63420858-9381-4b2c-930c-7e36d1a9e05d';
DELETE FROM teams WHERE id = '63420858-9381-4b2c-930c-7e36d1a9e05d';

-- U12 3조: 양주JUST유소년 U12 → 경기양주JUST유소년U12
UPDATE matches SET home_team_id = '95062c2b-bcb6-4c86-9899-0fa18da0ac12' WHERE home_team_id = '2aba1c4b-b20a-4f5d-b98e-5cfab587a401';
UPDATE matches SET away_team_id = '95062c2b-bcb6-4c86-9899-0fa18da0ac12' WHERE away_team_id = '2aba1c4b-b20a-4f5d-b98e-5cfab587a401';
UPDATE fair_play_points SET team_id = '95062c2b-bcb6-4c86-9899-0fa18da0ac12' WHERE team_id = '2aba1c4b-b20a-4f5d-b98e-5cfab587a401';
DELETE FROM teams WHERE id = '2aba1c4b-b20a-4f5d-b98e-5cfab587a401';

-- U12 3조: 화랑 U12 → 서울화랑U12
UPDATE matches SET home_team_id = 'a6293c51-cabb-4a33-875f-b11fa1b1837c' WHERE home_team_id = 'ab36b913-3eca-475d-a7b5-89769daa5d84';
UPDATE matches SET away_team_id = 'a6293c51-cabb-4a33-875f-b11fa1b1837c' WHERE away_team_id = 'ab36b913-3eca-475d-a7b5-89769daa5d84';
UPDATE fair_play_points SET team_id = 'a6293c51-cabb-4a33-875f-b11fa1b1837c' WHERE team_id = 'ab36b913-3eca-475d-a7b5-89769daa5d84';
DELETE FROM teams WHERE id = 'ab36b913-3eca-475d-a7b5-89769daa5d84';

-- U12 4조: YSC U12 → 인천YSCU12
UPDATE matches SET home_team_id = 'e8bd61da-8ed9-4679-9bc7-973c130a7163' WHERE home_team_id = '9f13a40f-8f66-474f-949a-5b5f4972b7fc';
UPDATE matches SET away_team_id = 'e8bd61da-8ed9-4679-9bc7-973c130a7163' WHERE away_team_id = '9f13a40f-8f66-474f-949a-5b5f4972b7fc';
UPDATE fair_play_points SET team_id = 'e8bd61da-8ed9-4679-9bc7-973c130a7163' WHERE team_id = '9f13a40f-8f66-474f-949a-5b5f4972b7fc';
DELETE FROM teams WHERE id = '9f13a40f-8f66-474f-949a-5b5f4972b7fc';

-- U12 4조: TEAM6 FC → 경기TEAM6FC
UPDATE matches SET home_team_id = '99e99c1d-5f3d-4a89-9504-8e67de4a0385' WHERE home_team_id = '48772f7e-3869-46b4-8978-4c57c42b8ce5';
UPDATE matches SET away_team_id = '99e99c1d-5f3d-4a89-9504-8e67de4a0385' WHERE away_team_id = '48772f7e-3869-46b4-8978-4c57c42b8ce5';
UPDATE fair_play_points SET team_id = '99e99c1d-5f3d-4a89-9504-8e67de4a0385' WHERE team_id = '48772f7e-3869-46b4-8978-4c57c42b8ce5';
DELETE FROM teams WHERE id = '48772f7e-3869-46b4-8978-4c57c42b8ce5';

-- U12 4조: 관악FC U12 → 서울관악FCU12
UPDATE matches SET home_team_id = '549bdb9c-51af-4922-8695-7f0028648c94' WHERE home_team_id = '224e1bd9-2c07-4b10-8f3c-8f98f2deaf30';
UPDATE matches SET away_team_id = '549bdb9c-51af-4922-8695-7f0028648c94' WHERE away_team_id = '224e1bd9-2c07-4b10-8f3c-8f98f2deaf30';
UPDATE fair_play_points SET team_id = '549bdb9c-51af-4922-8695-7f0028648c94' WHERE team_id = '224e1bd9-2c07-4b10-8f3c-8f98f2deaf30';
DELETE FROM teams WHERE id = '224e1bd9-2c07-4b10-8f3c-8f98f2deaf30';

-- U12 5조: 인유서구 U12 → 인천인유서구U12
UPDATE matches SET home_team_id = '17eb44ca-9352-45e4-8a44-bbead4a4cad3' WHERE home_team_id = '5f849a6b-4c73-468e-b50a-aa5183c5d2da';
UPDATE matches SET away_team_id = '17eb44ca-9352-45e4-8a44-bbead4a4cad3' WHERE away_team_id = '5f849a6b-4c73-468e-b50a-aa5183c5d2da';
UPDATE fair_play_points SET team_id = '17eb44ca-9352-45e4-8a44-bbead4a4cad3' WHERE team_id = '5f849a6b-4c73-468e-b50a-aa5183c5d2da';
DELETE FROM teams WHERE id = '5f849a6b-4c73-468e-b50a-aa5183c5d2da';

-- U12 6조: 남양산FC U12 → 경남남양산FCU12
UPDATE matches SET home_team_id = 'ccb80a2e-74f4-4870-a5c0-791c8fbea51f' WHERE home_team_id = 'f4e208cf-dd4c-4446-a3b4-d3df79d3d172';
UPDATE matches SET away_team_id = 'ccb80a2e-74f4-4870-a5c0-791c8fbea51f' WHERE away_team_id = 'f4e208cf-dd4c-4446-a3b4-d3df79d3d172';
UPDATE fair_play_points SET team_id = 'ccb80a2e-74f4-4870-a5c0-791c8fbea51f' WHERE team_id = 'f4e208cf-dd4c-4446-a3b4-d3df79d3d172';
DELETE FROM teams WHERE id = 'f4e208cf-dd4c-4446-a3b4-d3df79d3d172';

-- U12 6조: 일산JFC U12 → 경기일산JFCU12
UPDATE matches SET home_team_id = '0c5c88f6-d6ff-46aa-985b-7b9172684dbf' WHERE home_team_id = '6c811974-44b4-420c-ab29-612882b29ef0';
UPDATE matches SET away_team_id = '0c5c88f6-d6ff-46aa-985b-7b9172684dbf' WHERE away_team_id = '6c811974-44b4-420c-ab29-612882b29ef0';
UPDATE fair_play_points SET team_id = '0c5c88f6-d6ff-46aa-985b-7b9172684dbf' WHERE team_id = '6c811974-44b4-420c-ab29-612882b29ef0';
DELETE FROM teams WHERE id = '6c811974-44b4-420c-ab29-612882b29ef0';

-- U12 6조: FC한마음 U12 → 서울노원FC한마음U12
UPDATE matches SET home_team_id = 'a223afad-a6c4-4eb7-8fec-65155e7f69a3' WHERE home_team_id = '3a6161e2-eb2c-416b-8adb-106f25003953';
UPDATE matches SET away_team_id = 'a223afad-a6c4-4eb7-8fec-65155e7f69a3' WHERE away_team_id = '3a6161e2-eb2c-416b-8adb-106f25003953';
UPDATE fair_play_points SET team_id = 'a223afad-a6c4-4eb7-8fec-65155e7f69a3' WHERE team_id = '3a6161e2-eb2c-416b-8adb-106f25003953';
DELETE FROM teams WHERE id = '3a6161e2-eb2c-416b-8adb-106f25003953';

-- U12 7조: 안양AFA U12 → 경기안양AFAU12
UPDATE matches SET home_team_id = 'd8ac7938-d38e-4189-930c-04592a5c4cfd' WHERE home_team_id = '79eb1e0d-4901-4bbc-86d1-36a4a5974f5e';
UPDATE matches SET away_team_id = 'd8ac7938-d38e-4189-930c-04592a5c4cfd' WHERE away_team_id = '79eb1e0d-4901-4bbc-86d1-36a4a5974f5e';
UPDATE fair_play_points SET team_id = 'd8ac7938-d38e-4189-930c-04592a5c4cfd' WHERE team_id = '79eb1e0d-4901-4bbc-86d1-36a4a5974f5e';
DELETE FROM teams WHERE id = '79eb1e0d-4901-4bbc-86d1-36a4a5974f5e';

-- U12 7조: 위례FC U12 → 서울위례FCU12
UPDATE matches SET home_team_id = 'b1f5cf3f-4fad-4df5-841c-d99a40c7ceaf' WHERE home_team_id = '18957e0c-b2e3-43e3-930c-d72c88b3861d';
UPDATE matches SET away_team_id = 'b1f5cf3f-4fad-4df5-841c-d99a40c7ceaf' WHERE away_team_id = '18957e0c-b2e3-43e3-930c-d72c88b3861d';
UPDATE fair_play_points SET team_id = 'b1f5cf3f-4fad-4df5-841c-d99a40c7ceaf' WHERE team_id = '18957e0c-b2e3-43e3-930c-d72c88b3861d';
DELETE FROM teams WHERE id = '18957e0c-b2e3-43e3-930c-d72c88b3861d';

-- U12 7조: 제주SK U12 → 제주SKU12
UPDATE matches SET home_team_id = '5205b725-716d-4c7d-a38a-a5939b834511' WHERE home_team_id = 'd5c4e3dd-1692-4c3e-b8d5-83e40a712288';
UPDATE matches SET away_team_id = '5205b725-716d-4c7d-a38a-a5939b834511' WHERE away_team_id = 'd5c4e3dd-1692-4c3e-b8d5-83e40a712288';
UPDATE fair_play_points SET team_id = '5205b725-716d-4c7d-a38a-a5939b834511' WHERE team_id = 'd5c4e3dd-1692-4c3e-b8d5-83e40a712288';
DELETE FROM teams WHERE id = 'd5c4e3dd-1692-4c3e-b8d5-83e40a712288';

-- U12 8조: 화성시 U12 → 경기화성시U12
UPDATE matches SET home_team_id = '2a2939ef-d3ab-4f6e-bc42-998acf8d49c9' WHERE home_team_id = '8b615e9b-8f75-4331-8eac-b5a9eea4de0c';
UPDATE matches SET away_team_id = '2a2939ef-d3ab-4f6e-bc42-998acf8d49c9' WHERE away_team_id = '8b615e9b-8f75-4331-8eac-b5a9eea4de0c';
UPDATE fair_play_points SET team_id = '2a2939ef-d3ab-4f6e-bc42-998acf8d49c9' WHERE team_id = '8b615e9b-8f75-4331-8eac-b5a9eea4de0c';
DELETE FROM teams WHERE id = '8b615e9b-8f75-4331-8eac-b5a9eea4de0c';

-- U12 8조: GOATFC U12 → 제주GOATFCU12
UPDATE matches SET home_team_id = '199d7efb-093d-4f50-b76a-2e97ee7f6cbb' WHERE home_team_id = '3fc5eb33-7e98-448e-823c-24d85ac66c30';
UPDATE matches SET away_team_id = '199d7efb-093d-4f50-b76a-2e97ee7f6cbb' WHERE away_team_id = '3fc5eb33-7e98-448e-823c-24d85ac66c30';
UPDATE fair_play_points SET team_id = '199d7efb-093d-4f50-b76a-2e97ee7f6cbb' WHERE team_id = '3fc5eb33-7e98-448e-823c-24d85ac66c30';
DELETE FROM teams WHERE id = '3fc5eb33-7e98-448e-823c-24d85ac66c30';

-- U12 9조: 성남시티FC U12 → 경기성남시티FCU12
UPDATE matches SET home_team_id = '7ea393ff-fc9a-49a8-a9bb-9bbc1a6ffe06' WHERE home_team_id = 'c2eeddba-917f-4ac5-bcda-d587e1274e7e';
UPDATE matches SET away_team_id = '7ea393ff-fc9a-49a8-a9bb-9bbc1a6ffe06' WHERE away_team_id = 'c2eeddba-917f-4ac5-bcda-d587e1274e7e';
UPDATE fair_play_points SET team_id = '7ea393ff-fc9a-49a8-a9bb-9bbc1a6ffe06' WHERE team_id = 'c2eeddba-917f-4ac5-bcda-d587e1274e7e';
DELETE FROM teams WHERE id = 'c2eeddba-917f-4ac5-bcda-d587e1274e7e';

-- U12 9조: 마포스포츠클럽 U12 → 서울마포스포츠클럽U12
UPDATE matches SET home_team_id = '8bbac64b-357f-48c0-a319-2482f8385e93' WHERE home_team_id = 'a1354820-ebfe-4ca9-bf7b-2ed6e5f88da7';
UPDATE matches SET away_team_id = '8bbac64b-357f-48c0-a319-2482f8385e93' WHERE away_team_id = 'a1354820-ebfe-4ca9-bf7b-2ed6e5f88da7';
UPDATE fair_play_points SET team_id = '8bbac64b-357f-48c0-a319-2482f8385e93' WHERE team_id = 'a1354820-ebfe-4ca9-bf7b-2ed6e5f88da7';
DELETE FROM teams WHERE id = 'a1354820-ebfe-4ca9-bf7b-2ed6e5f88da7';

-- U12 10조: SSJFC U12 → 경기SSJFCU12
UPDATE matches SET home_team_id = 'c673c508-b9d1-420e-b91f-5a43f8d3f86c' WHERE home_team_id = '4fc6646c-61f9-457e-b160-ebf09de79fa3';
UPDATE matches SET away_team_id = 'c673c508-b9d1-420e-b91f-5a43f8d3f86c' WHERE away_team_id = '4fc6646c-61f9-457e-b160-ebf09de79fa3';
UPDATE fair_play_points SET team_id = 'c673c508-b9d1-420e-b91f-5a43f8d3f86c' WHERE team_id = '4fc6646c-61f9-457e-b160-ebf09de79fa3';
DELETE FROM teams WHERE id = '4fc6646c-61f9-457e-b160-ebf09de79fa3';

-- U12 10조: AAFC U12 → 서울AAFCU12
UPDATE matches SET home_team_id = '912584ba-983b-4298-876a-7c411af59689' WHERE home_team_id = 'e696d6c4-075e-4750-bdf8-a92dc2f8bcc9';
UPDATE matches SET away_team_id = '912584ba-983b-4298-876a-7c411af59689' WHERE away_team_id = 'e696d6c4-075e-4750-bdf8-a92dc2f8bcc9';
UPDATE fair_play_points SET team_id = '912584ba-983b-4298-876a-7c411af59689' WHERE team_id = 'e696d6c4-075e-4750-bdf8-a92dc2f8bcc9';
DELETE FROM teams WHERE id = 'e696d6c4-075e-4750-bdf8-a92dc2f8bcc9';

-- U12 10조: 프로FC U12 → 제주프로FCU12
UPDATE matches SET home_team_id = '2f92de60-4274-4562-810f-99549b6e7f84' WHERE home_team_id = 'ee4f68bd-a4a6-447d-8ed3-8b1daeaaed3d';
UPDATE matches SET away_team_id = '2f92de60-4274-4562-810f-99549b6e7f84' WHERE away_team_id = 'ee4f68bd-a4a6-447d-8ed3-8b1daeaaed3d';
UPDATE fair_play_points SET team_id = '2f92de60-4274-4562-810f-99549b6e7f84' WHERE team_id = 'ee4f68bd-a4a6-447d-8ed3-8b1daeaaed3d';
DELETE FROM teams WHERE id = 'ee4f68bd-a4a6-447d-8ed3-8b1daeaaed3d';

-- U12 11조: FCMJ 풋볼아카데미 → 부산FCMJ풋볼아카데미
UPDATE matches SET home_team_id = '8e7c4b3f-2002-4162-85b7-e501eaa5cea0' WHERE home_team_id = '634c68d7-3600-4a55-bad1-c58ba1e4edd3';
UPDATE matches SET away_team_id = '8e7c4b3f-2002-4162-85b7-e501eaa5cea0' WHERE away_team_id = '634c68d7-3600-4a55-bad1-c58ba1e4edd3';
UPDATE fair_play_points SET team_id = '8e7c4b3f-2002-4162-85b7-e501eaa5cea0' WHERE team_id = '634c68d7-3600-4a55-bad1-c58ba1e4edd3';
DELETE FROM teams WHERE id = '634c68d7-3600-4a55-bad1-c58ba1e4edd3';

-- U12 12조: 연산SC U12 → 부산연산SCU12
UPDATE matches SET home_team_id = '125d8f1e-e5eb-49b2-a07e-fdfbc9f79695' WHERE home_team_id = '58336281-02be-4cc1-9f37-e2cb97f6d4e0';
UPDATE matches SET away_team_id = '125d8f1e-e5eb-49b2-a07e-fdfbc9f79695' WHERE away_team_id = '58336281-02be-4cc1-9f37-e2cb97f6d4e0';
UPDATE fair_play_points SET team_id = '125d8f1e-e5eb-49b2-a07e-fdfbc9f79695' WHERE team_id = '58336281-02be-4cc1-9f37-e2cb97f6d4e0';
DELETE FROM teams WHERE id = '58336281-02be-4cc1-9f37-e2cb97f6d4e0';

-- U12 12조: 바모스FC U12 → 제주바모스FCU12
UPDATE matches SET home_team_id = 'ab6b00c7-2d70-458d-9b2b-11b0d67e50ea' WHERE home_team_id = 'bb0ecf29-c3a3-4c93-9585-1c237d3522be';
UPDATE matches SET away_team_id = 'ab6b00c7-2d70-458d-9b2b-11b0d67e50ea' WHERE away_team_id = 'bb0ecf29-c3a3-4c93-9585-1c237d3522be';
UPDATE fair_play_points SET team_id = 'ab6b00c7-2d70-458d-9b2b-11b0d67e50ea' WHERE team_id = 'bb0ecf29-c3a3-4c93-9585-1c237d3522be';
DELETE FROM teams WHERE id = 'bb0ecf29-c3a3-4c93-9585-1c237d3522be';

-- U12 13조: 신답FC U12 → 서울신답FCU12
UPDATE matches SET home_team_id = 'e909eae1-8921-4573-8c46-7fa4966683ff' WHERE home_team_id = '4504d0af-0a37-49f0-b4a4-e59cbce776b9';
UPDATE matches SET away_team_id = 'e909eae1-8921-4573-8c46-7fa4966683ff' WHERE away_team_id = '4504d0af-0a37-49f0-b4a4-e59cbce776b9';
UPDATE fair_play_points SET team_id = 'e909eae1-8921-4573-8c46-7fa4966683ff' WHERE team_id = '4504d0af-0a37-49f0-b4a4-e59cbce776b9';
DELETE FROM teams WHERE id = '4504d0af-0a37-49f0-b4a4-e59cbce776b9';

-- U12 14조: 강릉온리원FC U12 → 강원강릉온리원FCU12
UPDATE matches SET home_team_id = '87ee1167-13b9-446b-98da-9ef37fd6b69e' WHERE home_team_id = '94f63d10-6bf4-4e6c-8235-397f7fdd91ee';
UPDATE matches SET away_team_id = '87ee1167-13b9-446b-98da-9ef37fd6b69e' WHERE away_team_id = '94f63d10-6bf4-4e6c-8235-397f7fdd91ee';
UPDATE fair_play_points SET team_id = '87ee1167-13b9-446b-98da-9ef37fd6b69e' WHERE team_id = '94f63d10-6bf4-4e6c-8235-397f7fdd91ee';
DELETE FROM teams WHERE id = '94f63d10-6bf4-4e6c-8235-397f7fdd91ee';

-- U12 15조: JK풋볼 U12 → 광주JK풋볼U12
UPDATE matches SET home_team_id = 'a48c788b-4959-47c3-9bf9-d38331ed47b4' WHERE home_team_id = '603c35bd-faad-4666-a469-fa07a005e9e1';
UPDATE matches SET away_team_id = 'a48c788b-4959-47c3-9bf9-d38331ed47b4' WHERE away_team_id = '603c35bd-faad-4666-a469-fa07a005e9e1';
UPDATE fair_play_points SET team_id = 'a48c788b-4959-47c3-9bf9-d38331ed47b4' WHERE team_id = '603c35bd-faad-4666-a469-fa07a005e9e1';
DELETE FROM teams WHERE id = '603c35bd-faad-4666-a469-fa07a005e9e1';

-- U12 15조: 연수구청 유소년 U12 → 인천연수구청유소년축구단U12
UPDATE matches SET home_team_id = 'fb856660-0203-4f8d-b952-c4b335d88572' WHERE home_team_id = '8bbab0f2-4268-4104-b150-54fb0eaef035';
UPDATE matches SET away_team_id = 'fb856660-0203-4f8d-b952-c4b335d88572' WHERE away_team_id = '8bbab0f2-4268-4104-b150-54fb0eaef035';
UPDATE fair_play_points SET team_id = 'fb856660-0203-4f8d-b952-c4b335d88572' WHERE team_id = '8bbab0f2-4268-4104-b150-54fb0eaef035';
DELETE FROM teams WHERE id = '8bbab0f2-4268-4104-b150-54fb0eaef035';

-- U12 16조: 청주CTS U12 → 충북청주CTSU12
UPDATE matches SET home_team_id = '8a548575-4ffb-4bf9-a365-034f3f6d11a4' WHERE home_team_id = '289a28e4-7b8a-4cfc-9e87-0cfa7cd54562';
UPDATE matches SET away_team_id = '8a548575-4ffb-4bf9-a365-034f3f6d11a4' WHERE away_team_id = '289a28e4-7b8a-4cfc-9e87-0cfa7cd54562';
UPDATE fair_play_points SET team_id = '8a548575-4ffb-4bf9-a365-034f3f6d11a4' WHERE team_id = '289a28e4-7b8a-4cfc-9e87-0cfa7cd54562';
DELETE FROM teams WHERE id = '289a28e4-7b8a-4cfc-9e87-0cfa7cd54562';

-- U12 16조: 계양구유소년 U12 → 인천계양구유소년U12
UPDATE matches SET home_team_id = '3605bf0a-9d3f-48f3-97c1-93ff8d280148' WHERE home_team_id = '8548949e-44f6-46ec-bdd2-8bcf954f4c88';
UPDATE matches SET away_team_id = '3605bf0a-9d3f-48f3-97c1-93ff8d280148' WHERE away_team_id = '8548949e-44f6-46ec-bdd2-8bcf954f4c88';
UPDATE fair_play_points SET team_id = '3605bf0a-9d3f-48f3-97c1-93ff8d280148' WHERE team_id = '8548949e-44f6-46ec-bdd2-8bcf954f4c88';
DELETE FROM teams WHERE id = '8548949e-44f6-46ec-bdd2-8bcf954f4c88';

-- U12 16조: 연세FC U12 → 경기연세FCU12
UPDATE matches SET home_team_id = '44e0c153-30fc-4ae4-8b9c-ca1703e4332f' WHERE home_team_id = 'b198c315-1417-417b-b2e5-20693d373bc4';
UPDATE matches SET away_team_id = '44e0c153-30fc-4ae4-8b9c-ca1703e4332f' WHERE away_team_id = 'b198c315-1417-417b-b2e5-20693d373bc4';
UPDATE fair_play_points SET team_id = '44e0c153-30fc-4ae4-8b9c-ca1703e4332f' WHERE team_id = 'b198c315-1417-417b-b2e5-20693d373bc4';
DELETE FROM teams WHERE id = 'b198c315-1417-417b-b2e5-20693d373bc4';

COMMIT;
-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용