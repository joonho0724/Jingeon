# 팀 번호 업데이트 가이드

## 개요
`teams` 테이블의 `group_team_no1` (1차 리그 조 내 팀 번호)를 Supabase SQL Editor에서 직접 업데이트하는 방법입니다.

## 테이블 구조
- `name`: 팀명
- `age_group`: 연령대 ('U11' 또는 'U12')
- `group_name1`: 1차 리그 조 (예: 'A', 'B', 'C', ...)
- `group_team_no1`: 1차 리그 조 내 팀 번호 (1~4, NULL 가능)

## 기본 사용법

### 1. 특정 팀의 팀 번호 업데이트
```sql
UPDATE teams 
SET group_team_no1 = 1  -- 조 내 팀 번호 (1~4)
WHERE name = '팀명' 
  AND age_group = 'U11'  -- 또는 'U12'
  AND group_name1 = 'A';  -- 조 이름
```

### 2. 여러 팀의 팀 번호 일괄 업데이트
```sql
UPDATE teams 
SET group_team_no1 = CASE 
  WHEN name = '팀1' AND age_group = 'U11' AND group_name1 = 'A' THEN 1
  WHEN name = '팀2' AND age_group = 'U11' AND group_name1 = 'A' THEN 2
  WHEN name = '팀3' AND age_group = 'U11' AND group_name1 = 'A' THEN 3
  WHEN name = '팀4' AND age_group = 'U11' AND group_name1 = 'A' THEN 4
  ELSE group_team_no1  -- 변경하지 않음
END
WHERE (name = '팀1' OR name = '팀2' OR name = '팀3' OR name = '팀4')
  AND age_group = 'U11'
  AND group_name1 = 'A';
```

### 3. 조별로 팀 번호 업데이트 (예시: U11 A조)
```sql
UPDATE teams 
SET group_team_no1 = CASE 
  WHEN name = '제주제주서초' THEN 1
  WHEN name = '서울K리거강용FCB' THEN 2
  WHEN name = '제주SKU12' THEN 3
  WHEN name = '서울신용산초' THEN 4
  ELSE group_team_no1
END
WHERE age_group = 'U11' 
  AND group_name1 = 'A'
  AND (name IN ('제주제주서초', '서울K리거강용FCB', '제주SKU12', '서울신용산초'));
```

## 조회 쿼리

### 1. 모든 팀의 팀 번호 확인
```sql
SELECT 
  name,
  age_group,
  group_name1,
  group_team_no1,
  registration_no
FROM teams
ORDER BY age_group, group_name1, group_team_no1 NULLS LAST, name;
```

### 2. 특정 조의 팀 목록 확인
```sql
SELECT 
  name,
  age_group,
  group_name1,
  group_team_no1
FROM teams
WHERE age_group = 'U11'  -- 또는 'U12'
  AND group_name1 = 'A'  -- 조 이름
ORDER BY group_team_no1 NULLS LAST, name;
```

### 3. 팀 번호가 없는 팀 확인
```sql
SELECT 
  name,
  age_group,
  group_name1,
  group_team_no1
FROM teams
WHERE group_team_no1 IS NULL
ORDER BY age_group, group_name1, name;
```

## 주의사항

1. **팀 번호는 1~4 사이의 값**이어야 합니다 (조당 4팀).
2. **같은 조 내에서 팀 번호는 중복되지 않아야** 합니다.
3. **업데이트 전에 조회 쿼리로 확인**하는 것을 권장합니다.
4. **트랜잭션 사용**: 여러 팀을 업데이트할 때는 트랜잭션을 사용하세요.

## 트랜잭션 사용 예시

```sql
BEGIN;

-- 업데이트 작업
UPDATE teams 
SET group_team_no1 = 1
WHERE name = '팀1' AND age_group = 'U11' AND group_name1 = 'A';

UPDATE teams 
SET group_team_no1 = 2
WHERE name = '팀2' AND age_group = 'U11' AND group_name1 = 'A';

-- 확인 후 커밋 또는 롤백
-- COMMIT;  -- 변경사항 확정
-- ROLLBACK;  -- 변경사항 취소
```

## 대량 업데이트 (CSV 형식)

1. 임시 테이블 생성
```sql
CREATE TEMP TABLE team_numbers_temp (
  team_name TEXT,
  age_group TEXT,
  group_name TEXT,
  team_no INTEGER
);
```

2. 데이터 삽입
```sql
INSERT INTO team_numbers_temp (team_name, age_group, group_name, team_no) VALUES
  ('팀1', 'U11', 'A', 1),
  ('팀2', 'U11', 'A', 2),
  ('팀3', 'U11', 'A', 3),
  ('팀4', 'U11', 'A', 4);
```

3. 팀 번호 업데이트
```sql
UPDATE teams t
SET group_team_no1 = tn.team_no
FROM team_numbers_temp tn
WHERE t.name = tn.team_name
  AND t.age_group = tn.age_group
  AND t.group_name1 = tn.group_name;
```

4. 임시 테이블 삭제
```sql
DROP TABLE team_numbers_temp;
```

## 팀 번호 초기화

모든 팀 번호를 NULL로 초기화하려면:
```sql
UPDATE teams 
SET group_team_no1 = NULL;
```

⚠️ **주의**: 이 작업은 되돌릴 수 없으므로 신중하게 실행하세요.
