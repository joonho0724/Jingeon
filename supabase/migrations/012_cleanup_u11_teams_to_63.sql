-- ⚠️ DEV/MAINTENANCE ONLY
-- U11 팀 수를 63개로 맞추기 위한 일회성 정리 스크립트입니다.
-- 운영 환경에서 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

BEGIN;
-- U11 팀을 정확히 63개로 정리
-- 생성일: 2026-02-05T06:02:26.983Z
-- team-names.txt 파일 기준

-- 1조 1번: 제주서초
UPDATE teams SET group_name1 = '1', group_team_no1 = 1 WHERE id = 'e8259351-117b-49a2-86dc-7be107b54b60';

-- 1조 2번: K리거강용FC B
UPDATE teams SET group_name1 = '1', group_team_no1 = 2 WHERE id = 'a30b7eaf-2834-45b2-834c-1416ccf83771';

-- 1조 3번: 일산JFC U12
UPDATE teams SET group_name1 = '1', group_team_no1 = 3 WHERE id = 'd31cd2b0-ed62-4268-9156-d21e70dac6fe';

-- 1조 4번: 리틀코리아FC U12
UPDATE teams SET group_name1 = '1', group_team_no1 = 4 WHERE id = 'a8713945-87e1-443c-ab02-fa94fca4b2c2';

-- 2조 1번: 대정초
UPDATE teams SET group_name1 = '2', group_team_no1 = 1 WHERE id = 'f084ce43-c837-479c-86c9-cbf6a8cc1747';

-- 2조 2번: 솔트FC U12
UPDATE teams SET group_name1 = '2', group_team_no1 = 2 WHERE id = '3c9e45c4-6ee9-4fc0-b8f1-4f34b302de96';

-- 2조 3번: 고양무원FC U12
UPDATE teams SET group_name1 = '2', group_team_no1 = 3 WHERE id = 'ee0e6d8c-2623-4f88-ae66-4f9d1293281a';

-- 2조 4번: 계양구유소년 U12
UPDATE teams SET group_name1 = '2', group_team_no1 = 4 WHERE id = 'a5a0fb05-d2a1-4018-ac6f-ee713309a344';

-- 3조 2번: 화랑 U12
UPDATE teams SET group_name1 = '3', group_team_no1 = 2 WHERE id = '79e43a11-93b0-470e-8a97-588cddb74768';

-- 3조 3번: 연세FC U12
UPDATE teams SET group_name1 = '3', group_team_no1 = 3 WHERE id = '6ae2a379-f081-46f1-bb2d-0c2aedae480f';

-- 3조 4번: 인유서구 U12
UPDATE teams SET group_name1 = '3', group_team_no1 = 4 WHERE id = 'd76bd541-e7db-431a-9c5d-e2fe0ec818f5';

-- 4조 1번: 제주동초
UPDATE teams SET group_name1 = '4', group_team_no1 = 1 WHERE id = 'b5575bc6-a212-4a7d-a998-48c2fb7e9c21';

-- 4조 2번: 관악FC U12
UPDATE teams SET group_name1 = '4', group_team_no1 = 2 WHERE id = '1a16ae22-8893-4bb7-bf37-8e22619e8f8b';

-- 4조 3번: TEAM6 FC
UPDATE teams SET group_name1 = '4', group_team_no1 = 3 WHERE id = 'b57e94b1-65e1-4f1b-a986-7eeb603b8bb9';

-- 4조 4번: 축구의신 U12
UPDATE teams SET group_name1 = '4', group_team_no1 = 4 WHERE id = 'e4f0ead2-ed7d-46a0-9caf-c30799905ce3';

-- 5조 1번: 제주SK U12
UPDATE teams SET group_name1 = '5', group_team_no1 = 1 WHERE id = '888e7e0f-4360-467a-b883-c706e41f09db';

-- 5조 2번: 신용산초
UPDATE teams SET group_name1 = '5', group_team_no1 = 2 WHERE id = 'd41462f1-3169-44aa-9d62-b8bf9e699be8';

-- 5조 3번: 월드컵FC U12
UPDATE teams SET group_name1 = '5', group_team_no1 = 3 WHERE id = 'b10e40e1-e8ed-4c98-8fb3-5ad17e3a3c8b';

-- 5조 4번: 남양산FC U12
UPDATE teams SET group_name1 = '5', group_team_no1 = 4 WHERE id = '298e9a62-20be-4bae-909c-34d7fffb57d0';

-- 6조 2번: 구룡초
UPDATE teams SET group_name1 = '6', group_team_no1 = 2 WHERE id = 'eee6ce2d-2893-470b-91de-534fedc52d51';

-- 6조 3번: 용인대YFC U12
UPDATE teams SET group_name1 = '6', group_team_no1 = 3 WHERE id = '31b08a19-35b4-49e1-b3a5-cd16289c94ac';

-- 6조 4번: 보물섬남해SC U12
UPDATE teams SET group_name1 = '6', group_team_no1 = 4 WHERE id = '056b9be3-d29b-4a72-9644-c8e248d0ac81';

-- 7조 1번: 서귀포초
UPDATE teams SET group_name1 = '7', group_team_no1 = 1 WHERE id = 'fb5263fc-254d-45eb-8998-a6c1fe42e6b7';

-- 7조 2번: 위례FC U12
UPDATE teams SET group_name1 = '7', group_team_no1 = 2 WHERE id = 'ad908a0c-a309-4573-a861-193d4a579b69';

-- 7조 3번: FC진건블루
UPDATE teams SET group_name1 = '7', group_team_no1 = 3 WHERE id = '54cc15ce-b828-4d0e-9756-ff138034bb3d';

-- 7조 4번: 마산합성FC U12
UPDATE teams SET group_name1 = '7', group_team_no1 = 4 WHERE id = 'f0ceef4e-d94c-45b4-b01a-c267c120ecf7';

-- 8조 1번: 프로FC U12
UPDATE teams SET group_name1 = '8', group_team_no1 = 1 WHERE id = '6348bbde-1485-4253-8a09-07345cdaab8b';

-- 8조 2번: 신답FC U12 그린
UPDATE teams SET group_name1 = '8', group_team_no1 = 2 WHERE id = '12df77d1-6ac9-473e-8e7b-ef514b68f975';

-- 8조 3번: FC진건레드
UPDATE teams SET group_name1 = '8', group_team_no1 = 3 WHERE id = '26196ef7-b6ba-43a1-b084-362b49dddc4d';

-- 8조 4번: FCMJ 풋볼아카데미
UPDATE teams SET group_name1 = '8', group_team_no1 = 4 WHERE id = '97397b37-113e-4b83-88a8-7b4603e4d4c1';

-- 9조 1번: 외도초
UPDATE teams SET group_name1 = '9', group_team_no1 = 1 WHERE id = 'e73fe885-c289-4ea3-8a95-fde830d08d94';

-- 9조 2번: 신답FC U12 화이트
UPDATE teams SET group_name1 = '9', group_team_no1 = 2 WHERE id = '01229f87-8173-493d-aa76-44c4571e7747';

-- 9조 3번: 안양AFA U12
UPDATE teams SET group_name1 = '9', group_team_no1 = 3 WHERE id = 'd706238a-aa3d-4875-ab68-fd4387dca260';

-- 9조 4번: 연산SC U12 B
UPDATE teams SET group_name1 = '9', group_team_no1 = 4 WHERE id = '422a78fa-896b-4860-8f5c-1ff6edfc3b19';

-- 10조 2번: FC구로 U12
UPDATE teams SET group_name1 = '10', group_team_no1 = 2 WHERE id = 'b7b13975-2c5d-4572-9587-a3e36d378c63';

-- 10조 3번: 화성시 U12
UPDATE teams SET group_name1 = '10', group_team_no1 = 3 WHERE id = 'd98cbeaa-226b-4e66-b211-586375fec09a';

-- 10조 4번: 연산SC U12 A
UPDATE teams SET group_name1 = '10', group_team_no1 = 4 WHERE id = 'ce3ea0ca-c33d-4aad-af15-d0e53175c019';

-- 11조 2번: 서강초
UPDATE teams SET group_name1 = '11', group_team_no1 = 2 WHERE id = '8a80de3c-3bc9-4b05-b21b-5b75738ba5d7';

-- 11조 3번: 성남시티FC U12
UPDATE teams SET group_name1 = '11', group_team_no1 = 3 WHERE id = '3a06ad2b-f066-45cc-9a8c-ddcd2b4341ad';

-- 11조 4번: 달성군청유소년 U12 화원
UPDATE teams SET group_name1 = '11', group_team_no1 = 4 WHERE id = '82bbe182-5fa2-4a81-9745-d07b872abe19';

-- 12조 1번: 화북초
UPDATE teams SET group_name1 = '12', group_team_no1 = 1 WHERE id = 'be10f199-0e49-43e0-86b0-866fa770754e';

-- 12조 2번: 영등포구SC U12
UPDATE teams SET group_name1 = '12', group_team_no1 = 2 WHERE id = '2ba38de3-5fab-4afb-83bb-2b5a9d75f03a';

-- 12조 3번: SSJFC U12
UPDATE teams SET group_name1 = '12', group_team_no1 = 3 WHERE id = 'f96d548c-8e8c-4493-a8e3-b868d716412b';

-- 12조 4번: 하이두FC
UPDATE teams SET group_name1 = '12', group_team_no1 = 4 WHERE id = '7fcd313e-bb98-4a2c-8208-be771f3e183b';

-- 13조 1번: 중문초
UPDATE teams SET group_name1 = '13', group_team_no1 = 1 WHERE id = '6a5f524c-7390-4da1-94a9-edadc2fec1a8';

-- 13조 2번: K리거강용FC A
UPDATE teams SET group_name1 = '13', group_team_no1 = 2 WHERE id = 'd2e67a8a-8af2-4bbd-b9de-dcfe7e135528';

-- 13조 3번: 서창FC U12
UPDATE teams SET group_name1 = '13', group_team_no1 = 3 WHERE id = 'dce33ffe-8afd-4404-ab60-ed1496f8211b';

-- 13조 4번: 청주CTS U12
UPDATE teams SET group_name1 = '13', group_team_no1 = 4 WHERE id = 'fd6af8ec-4059-4124-9ad8-7c0d84b8eecc';

-- 14조 1번: 양강초
UPDATE teams SET group_name1 = '14', group_team_no1 = 1 WHERE id = '760a2ddf-d5c5-41dd-9b7c-ff842da5f39a';

-- 14조 2번: AAFC U12
UPDATE teams SET group_name1 = '14', group_team_no1 = 2 WHERE id = '067c325f-cecf-4c83-b140-706fcc801a8f';

-- 14조 3번: 강화SC U12
UPDATE teams SET group_name1 = '14', group_team_no1 = 3 WHERE id = 'a5837992-abc6-4ba9-861d-f2e46f957cd0';

-- 14조 4번: JK풋볼 U12
UPDATE teams SET group_name1 = '14', group_team_no1 = 4 WHERE id = '606c42d5-d627-4e1a-aca1-e69571acb5e5';

-- 15조 1번: 대동주니어FC
UPDATE teams SET group_name1 = '15', group_team_no1 = 1 WHERE id = '64a38ae7-c530-496f-909c-f0f1ad1ae585';

-- 15조 2번: 서초MB U12
UPDATE teams SET group_name1 = '15', group_team_no1 = 2 WHERE id = '36259140-2274-4067-98ef-81b10d9a3473';

-- 15조 3번: YSC U12
UPDATE teams SET group_name1 = '15', group_team_no1 = 3 WHERE id = '7ddca932-3ec3-4c77-be86-aee832c6de4f';

-- 15조 4번: 강릉온리원FC U12
UPDATE teams SET group_name1 = '15', group_team_no1 = 4 WHERE id = 'deaa83aa-2b41-40a5-a624-bbf11bd4517f';

-- 16조 1번: FC한마음
UPDATE teams SET group_name1 = '16', group_team_no1 = 1 WHERE id = '2189c58d-2ffa-4c2f-9262-e71c18947fa3';

-- 16조 2번: 스포트랙스FC U12
UPDATE teams SET group_name1 = '16', group_team_no1 = 2 WHERE id = '83eeab7c-096f-48ce-9c59-5db112473315';

-- 16조 3번: 연수구청 유소년 U12
UPDATE teams SET group_name1 = '16', group_team_no1 = 3 WHERE id = '1fc0c8cf-8cf4-4354-acd6-fa668c430dfc';

-- 매칭되지 않은 팀 삭제 (team-names.txt에 없는 팀)
-- 10조: 제주이천수축구클럽U12 (ID: 894e53d6-36bc-46e1-95bf-c3c90d0a9ab3)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = '894e53d6-36bc-46e1-95bf-c3c90d0a9ab3';

-- 11조: 대구달성군청유소년축구단U12화원 (ID: 140f237d-9568-4181-90c8-026caa54e4b0)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = '140f237d-9568-4181-90c8-026caa54e4b0';

-- 11조: 제주LOJEUNITEDU12 (ID: 17b66424-e0e6-4f62-92ad-323a114ef26e)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = '17b66424-e0e6-4f62-92ad-323a114ef26e';

-- 12조: 대구하이두축구클럽 (ID: 2d439189-b477-4d04-bfcb-3f00daf31327)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = '2d439189-b477-4d04-bfcb-3f00daf31327';

-- 12조: 서울영등포구스포츠클럽U12 (ID: de41bf26-7422-4d94-a619-220000c77d24)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = 'de41bf26-7422-4d94-a619-220000c77d24';

-- 14조: 인천강화스포츠클럽U12 (ID: e2524668-f7d3-4fb1-a589-5a91f2315534)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = 'e2524668-f7d3-4fb1-a589-5a91f2315534';

-- 15조: 서울서초MB U-12 (ID: a70c434e-0490-4b0f-9648-65fb60574e77)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = 'a70c434e-0490-4b0f-9648-65fb60574e77';

-- 16조: 스포트랙스FC U12 (ID: e63d2af9-f725-46bf-9abd-14a9582a3033)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = 'e63d2af9-f725-46bf-9abd-14a9582a3033';

-- 2조: 경기고양무원풋볼클럽U12 (ID: b9aa6c17-7161-42bd-a9e0-ef88cb40ad0c)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = 'b9aa6c17-7161-42bd-a9e0-ef88cb40ad0c';

-- 2조: 서울솔트축구클럽U12 (ID: 7c1d072f-4fc9-4d38-b3fc-edc215d89cc2)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = '7c1d072f-4fc9-4d38-b3fc-edc215d89cc2';

-- 3조: 제주더나이스U12 (ID: 4aca5caf-274d-4ac1-b945-5850b55dab75)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = '4aca5caf-274d-4ac1-b945-5850b55dab75';

-- 6조: 경남보물섬남해스포츠클럽U12 (ID: d4ab4e39-f8da-4dba-af99-77dd5a63f8d8)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = 'd4ab4e39-f8da-4dba-af99-77dd5a63f8d8';

-- 6조: 제주쏘니유소년축구클럽U12 (ID: ef4e7d77-47e9-4552-9dc6-615136c1e142)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = 'ef4e7d77-47e9-4552-9dc6-615136c1e142';

-- 7조: 경남마산합성풋볼클럽U12 (ID: 3bf9a6c1-c360-40f6-92fc-5f6c4788d2f5)
-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.
DELETE FROM teams WHERE id = '3bf9a6c1-c360-40f6-92fc-5f6c4788d2f5';

COMMIT;
-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용