'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Team, Venue } from '@/types/database';
import * as XLSX from 'xlsx';

interface BulkUploadFormProps {
  teams: Team[];
  venues: Venue[];
}

export default function BulkUploadForm({ teams, venues }: BulkUploadFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 팀명으로 팀 ID 찾기
  const findTeamId = (teamName: string, ageGroup?: 'U11' | 'U12', groupName?: string): string | null => {
    // 정확한 이름 매칭
    let found = teams.find(t => t.name === teamName);
    
    // 연령대와 조로 필터링
    if (!found && ageGroup) {
      found = teams.find(t => t.name === teamName && t.age_group === ageGroup);
    }
    
    if (!found && ageGroup && groupName) {
      found = teams.find(t => t.name === teamName && t.age_group === ageGroup && t.group_name === groupName);
    }
    
    return found?.id || null;
  };

  const venueCodeSet = new Set(venues.map((v) => v.code));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Excel 파일 읽기
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // 첫 번째 시트 읽기
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      // 헤더 행 찾기
      let headerRow = -1;
      const headerMap: Record<string, number> = {};
      
      for (let i = 0; i < Math.min(5, jsonData.length); i++) {
        const row = jsonData[i] as string[];
        if (row.includes('날짜') || row.includes('리그') || row.includes('홈팀')) {
          headerRow = i;
          row.forEach((cell, idx) => {
            const cellLower = String(cell).toLowerCase().trim();
            if (cellLower.includes('날짜')) headerMap.date = idx;
            if (cellLower.includes('시간')) headerMap.time = idx;
            if (cellLower.includes('리그') || cellLower.includes('round')) headerMap.round = idx;
            if (cellLower.includes('조') || cellLower.includes('group')) headerMap.group = idx;
            if (cellLower.includes('경기장') || cellLower.includes('venue') || cellLower.includes('pitch')) headerMap.pitch_code = idx;
            if (cellLower.includes('홈팀') || cellLower.includes('home')) headerMap.homeTeam = idx;
            if (cellLower.includes('원정팀') || cellLower.includes('away')) headerMap.awayTeam = idx;
            if (cellLower.includes('경기번호') || cellLower.includes('match_no') || cellLower.includes('match')) headerMap.match_no = idx;
            if (cellLower.includes('홈팀번호') || cellLower.includes('home_no')) headerMap.homeTeamNo = idx;
            if (cellLower.includes('원정팀번호') || cellLower.includes('away_no')) headerMap.awayTeamNo = idx;
          });
          break;
        }
      }

      if (headerRow === -1) {
        throw new Error('헤더 행을 찾을 수 없습니다. 양식을 다운로드하여 사용해주세요.');
      }

      // 데이터 행 처리
      const matches = [];
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = headerRow + 1; i < jsonData.length; i++) {
        const row = jsonData[i] as string[];
        
        // 빈 행 스킵
        if (!row || row.every(cell => !cell || String(cell).trim() === '')) continue;

        const date = String(row[headerMap.date] || '').trim();
        const time = String(row[headerMap.time] || '').trim();
        const round = String(row[headerMap.round] || '').trim();
        const group = String(row[headerMap.group] || '').trim();
        const pitchCode = String(row[headerMap.pitch_code] || '').trim();
        const homeTeamName = String(row[headerMap.homeTeam] || '').trim();
        const awayTeamName = String(row[headerMap.awayTeam] || '').trim();
        const matchNoRaw = headerMap.match_no !== undefined ? String(row[headerMap.match_no] || '').trim() : '';
        const homeTeamNoRaw = headerMap.homeTeamNo !== undefined ? String(row[headerMap.homeTeamNo] || '').trim() : '';
        const awayTeamNoRaw = headerMap.awayTeamNo !== undefined ? String(row[headerMap.awayTeamNo] || '').trim() : '';

        // 필수 필드 확인
        if (!date || !round || !group || !homeTeamName || !awayTeamName) {
          errors.push(`행 ${i + 1}: 필수 필드가 누락되었습니다.`);
          errorCount++;
          continue;
        }

        // 날짜 형식 변환 (YYYY-MM-DD)
        let formattedDate = date;
        if (date.includes('/')) {
          const parts = date.split('/');
          if (parts.length === 3) {
            const year = parts[0].length === 4 ? parts[0] : `2026`;
            formattedDate = `${year}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          }
        }

        // 시간 형식 확인 (HH:MM)
        let formattedTime = time || null;
        if (formattedTime && !formattedTime.includes(':')) {
          formattedTime = null;
        }

        // 리그 확인
        const roundValue = round.includes('1') || round.includes('1차') ? '1차' : 
                          round.includes('2') || round.includes('2차') ? '2차' : 
                          '1차';

        // 조 번호 추출 (숫자만)
        const groupNumber = group.replace(/[^0-9]/g, '');
        if (!groupNumber) {
          errors.push(`행 ${i + 1}: 조 번호를 찾을 수 없습니다.`);
          errorCount++;
          continue;
        }

        // 팀 ID 찾기
        const homeTeamId = findTeamId(homeTeamName);
        const awayTeamId = findTeamId(awayTeamName);

        if (!homeTeamId) {
          errors.push(`행 ${i + 1}: 홈팀 "${homeTeamName}"을 찾을 수 없습니다.`);
          errorCount++;
          continue;
        }

        if (!awayTeamId) {
          errors.push(`행 ${i + 1}: 원정팀 "${awayTeamName}"을 찾을 수 없습니다.`);
          errorCount++;
          continue;
        }

        if (homeTeamId === awayTeamId) {
          errors.push(`행 ${i + 1}: 홈팀과 원정팀이 같습니다.`);
          errorCount++;
          continue;
        }

        // 경기장 코드 검증(선택)
        const normalizedPitchCode = pitchCode ? pitchCode.toUpperCase() : '';
        if (normalizedPitchCode && venueCodeSet.size > 0 && !venueCodeSet.has(normalizedPitchCode)) {
          errors.push(`행 ${i + 1}: 경기장 코드 "${normalizedPitchCode}"가 venues에 없습니다.`);
          errorCount++;
          continue;
        }

        matches.push({
          date: formattedDate,
          time: formattedTime,
          round: roundValue,
          group_name: groupNumber,
          match_no: matchNoRaw ? Number(matchNoRaw) : null,
          pitch_code: normalizedPitchCode || null,
          home_team_no: homeTeamNoRaw ? Number(homeTeamNoRaw) : null,
          away_team_no: awayTeamNoRaw ? Number(awayTeamNoRaw) : null,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
        });
      }

      // 경기 일괄 삽입
      if (matches.length > 0) {
        const { error: insertError } = await supabase
          .from('matches')
          .insert(matches);

        if (insertError) {
          throw new Error(`경기 삽입 오류: ${insertError.message}`);
        }

        successCount = matches.length;
      }

      // 결과 메시지
      if (successCount > 0) {
        setSuccess(`${successCount}개 경기가 성공적으로 등록되었습니다.`);
        if (errorCount > 0) {
          setError(`${errorCount}개 경기 등록 실패:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n... 외 ${errors.length - 10}개 오류` : ''}`);
        }
        setTimeout(() => {
          router.refresh();
          router.push('/admin/matches');
        }, 2000);
      } else {
        setError(`등록된 경기가 없습니다. 오류:\n${errors.slice(0, 10).join('\n')}`);
      }
    } catch (err: any) {
      setError(err.message || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    // 팀 목록 시트
    const teamsByAge = {
      'U11': teams.filter(t => t.age_group === 'U11'),
      'U12': teams.filter(t => t.age_group === 'U12'),
    };

    const venuesData = [
      ['코드', '경기장명'],
      ...venues.map((v) => [v.code, v.name]),
    ];

    // 대진표 양식 시트
    const templateData = [
      ['날짜', '시간', '리그', '조', '경기번호', '경기장코드', '홈팀명', '원정팀명', '홈팀번호', '원정팀번호'],
      ['2026-02-06', '14:00', '1차', '1', '1', 'A', '서귀포FC', 'K리거강용FC', '1', '2'],
      ['2026-02-06', '15:00', '1차', '1', '2', 'A', '월드컵FC U12', '리틀코리아FC U12', '3', '4'],
      ['', '', '', '', '', '', ''],
      ['※ 참고사항:', '', '', '', '', '', ''],
      ['- 날짜 형식: YYYY-MM-DD (예: 2026-02-06)', '', '', '', '', '', ''],
      ['- 시간 형식: HH:MM (예: 14:00)', '', '', '', '', '', ''],
      ['- 리그: 1차 또는 2차', '', '', '', '', '', ''],
      ['- 조: 1~16 (숫자만)', '', '', '', '', '', ''],
      ['- 경기장코드: A~H (선택사항)', '', '', '', '', '', ''],
      ['- 경기번호: 조/리그 내에서 고유한 번호 (선택사항)', '', '', '', '', '', ''],
      ['- 팀명: 아래 팀 목록 시트의 정확한 팀명 사용', '', '', '', '', '', ''],
      ['- 홈팀번호/원정팀번호: 해당 조 내에서의 팀 번호 (선택사항)', '', '', '', '', '', ''],
    ];

    // Excel 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 대진표 양식 시트
    const templateSheet = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, templateSheet, '대진표 양식');

    // 팀 목록 시트 (U11)
    const u11TeamsData = [
      ['연령대', '조', '팀명'],
      ...teamsByAge['U11'].map(t => [t.age_group, t.group_name, t.name]),
    ];
    const u11Sheet = XLSX.utils.aoa_to_sheet(u11TeamsData);
    XLSX.utils.book_append_sheet(workbook, u11Sheet, 'U11 팀 목록');

    // 팀 목록 시트 (U12)
    const u12TeamsData = [
      ['연령대', '조', '팀명'],
      ...teamsByAge['U12'].map(t => [t.age_group, t.group_name, t.name]),
    ];
    const u12Sheet = XLSX.utils.aoa_to_sheet(u12TeamsData);
    XLSX.utils.book_append_sheet(workbook, u12Sheet, 'U12 팀 목록');

    // 경기장 목록 시트
    const venueSheet = XLSX.utils.aoa_to_sheet(venuesData);
    XLSX.utils.book_append_sheet(workbook, venueSheet, '경기장 목록');

    // 파일 다운로드
    XLSX.writeFile(workbook, '대진표_일괄입력_양식.xlsx');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">경기 일정 일괄 등록</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded whitespace-pre-line">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            양식 다운로드
          </button>
          
          <div className="flex-1">
            <label className="block">
              <span className="sr-only">파일 선택</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        {loading && (
          <div className="text-sm text-gray-600">
            파일을 처리하는 중...
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>사용 방법:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>위의 &quot;양식 다운로드&quot; 버튼을 클릭하여 Excel 양식을 다운로드합니다.</li>
            <li>양식 파일의 &quot;대진표 양식&quot; 시트에 경기 정보를 입력합니다.</li>
            <li>팀명은 &quot;U11 팀 목록&quot; 또는 &quot;U12 팀 목록&quot; 시트의 정확한 팀명을 사용하세요.</li>
            <li>경기장 코드는 &quot;경기장 목록&quot; 시트의 코드를 사용하세요.</li>
            <li>파일을 저장한 후 위의 파일 선택 버튼으로 업로드합니다.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
