export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대회규정</h1>
        <p className="text-gray-600">
          2026 서귀포 칠십리 춘계 유소년 축구 페스티벌
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>주최: 제주FA</p>
          <p>주관: 제주FA</p>
          <p>후원: 제주특별자치도 서귀포시</p>
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제1조 (명칭)</h2>
          <p className="text-gray-700">대회 명칭은 &apos;2026 서귀포 칠십리 춘계 유소년 축구 페스티벌&apos;이라 한다.</p>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제2조 (주최, 주관, 후원)</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>주최: 제주FA</li>
            <li>주관: 제주FA</li>
            <li>후원: 제주특별자치도 서귀포시</li>
          </ul>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제3조 (기간)</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>대회 기간은 2026년 2월 6일(금) ~ 2026년 2월 12일(목)까지 개최한다.</li>
            <li>경우에 따라 대회 기간 및 일정은 변경될 수 있다.</li>
          </ul>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제4조 (장소)</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>대회 장소는 제주특별자치도 일원에서 개최한다.</li>
            <li>경우에 따라 장소는 변경될 수 있다.</li>
          </ul>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제5조 (참가자격)</h2>
          <div className="space-y-3 text-gray-700">
            <p>① 본 대회는 대한축구협회(이하 &apos;협회&apos;라 한다) U12 전문축구 등록팀에 한하여 참가할 수 있으며, 5학년 이하인 선수만 참가신청 할 수 있다. 단, 여자선수의 경우 재학중인 학교의 학년보다 한 학년 아래부에 참가할 수 있다.</p>
            <p>② 참가하는 모든 팀의 선수는 &apos;학교장확인서&apos;, &apos;학교폭력부존재서약서&apos; 의무 제출해야 하며, 미제출된 선수는 대회 참가신청이 취소 된다.</p>
            <div className="ml-4 space-y-1 text-sm">
              <p>1. 제출방법: 대한축구협회 통합온라인시스템(joinkfa.com) 활용</p>
              <p>2. 학교장확인서상 선수별 기재 여부 체크</p>
              <p>3. 해당팀의 학교장확인서 스캔 및 업로드</p>
              <p className="ml-4">▸ 학원팀: 학교팀 단체 제출</p>
              <p className="ml-4">▸ 클럽팀: 각 선수별 학교장확인서 제출</p>
            </div>
            <p>③ 신규 선수: 등록규정에 준하여 등록한 자에 한하여 참가할 수 있다.</p>
            <p>④ 이적 선수: 등록규정에 준하여 등록한 선수에 한하여 참가할 수 있다.</p>
            <p>⑤ 해체된 팀의 선수: 등록규정에 준하여 등록한 선수에 한하여 참가할 수 있다.</p>
            <p>⑥ 징계중인 임원(지도자 포함): 등록된 임원(지도자 등)에 한하여 참가할 수 있다. 단, 경기출전(벤치착석 등)은 「제14조」규정에 따른다.</p>
            <p>⑦ 징계중인 선수: 등록된 선수에 한하여 참가할 수 있다. 단, 경기 출전은 「제15조」 규정에 따른다.</p>
            <p>⑧ 연령초과 선수: 경기 당일 출전선수 명단(18명 이내)에 최대 팀당 2명까지만 표기 및 출전할 수 있다. 단, 여자선수의 경우 연령초과 선수에서 제외한다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제6조 (참가신청)</h2>
          <div className="space-y-3 text-gray-700">
            <p>① 신청기간</p>
            <div className="ml-4 space-y-1 text-sm">
              <p>1. 팀명 참가신청</p>
              <p className="ml-4">- U11: 2026년 1월 14일(수) 10:00 ~ 15일(목) 18:00</p>
              <p className="ml-4">- U12만: 2026년 1월 15일(목) 10:00 ~ 18:00</p>
              <p>2. 팀명 참가신청 취소: 2026년 1월 16일(금) 10:00 ~ 19일(월) 18:00</p>
              <p>3. 추가 팀명 참가신청: 2026년 1월 20일(화) 10:00 ~ 18:00</p>
              <p>4. 선수∙지도자∙임원 참가신청: 2026년 1월 21일(수) 10:00 ~ 2월 5일(목) 18:00</p>
              <p>5. 참가 선수 배번: 1번 ~ 99번까지만 가능</p>
            </div>
            <p>② 참가 신청방법: 대한축구협회 통합 온라인시스템 (http://www.joinkfa.com) 전문축구팀 &gt; 대회 &gt; 해당 대회 리스트에서 참가신청</p>
            <p>③ 참가신청 확인: 참가신청을 완료한 팀은 신청한 대회의 이상 유.무와 참가신청서를 출력하여, 참가자(임원, 지도자, 선수)를 확인 하여야 한다.</p>
            <p>④ 참가신청 취소: 참가신청 기간 중 특정 사유에 의거하여 대회 참가취소를 하고자 할 경우에는, 참가신청한 대회의 주최(또는 주관) 단체에 공문(취소사유 명기)으로 취소 요청을 하여야 한다.</p>
            <p>⑤ 선수∙지도자∙임원 참가신청 기간 마감 이후 불참 팀은 협회 공정소위원회에 회부된다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제7조 (참가신청서 열람)</h2>
          <p className="text-gray-700">참가신청이 완료되면 참가신청한 팀 선수 명단을 열람하여 참가팀들이 확인 할 수 있도록 하고, 참가팀은 열람기간 중 규정위반 선수의 발견 시 주최단체로 이의 제기를 팀 대표 명의의 공문으로 신청할 수 있다.</p>
          <div className="mt-3 text-sm text-gray-600">
            <p>열람기간: 2026년 00월 00일(월) 00시 ~ 00시</p>
            <p>열람장소: 대한축구협회 통합 온라인시스템(http://www.joinkfa.com)</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제8조 (대표자 회의)</h2>
          <div className="space-y-2 text-gray-700">
            <p>참가팀 대표자 회의 일시와 장소는 아래와 같다.</p>
            <p>1. 일시: 미정 (추후공지)</p>
            <p>2. 장소: 미정 (추후공지)</p>
            <p>3. 대표자 회의에는 각 팀의 의사결정권이 있는 등록된 자(임원, 감독, 코치 등)만 참가할 수 있으며(학부모 불가), 불참으로 인한 불이익은 해당 팀이 감수하여야 한다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제9조 (대회의 취소)</h2>
          <div className="space-y-2 text-gray-700">
            <p>① 본 대회의 팀명참가신청과 선수∙지도자∙임원 참가신청 마감일까지 16개 팀에 미달할 경우 대회의 취소 여부는 협회에서 결정한다.</p>
            <p>② 선수∙지도자∙임원 참가신청 마감 후 각종 사유에 의거, 16개팀 미만일 경우 대회는 취소되지 않는다.</p>
            <p>③ 천재지변 또는 불가항력적인 상황이 발생하였을 경우, 주최 측에서 대회개최가 불가능하다고 판단할 경우에는 대회 개최를 취소 할 수 있다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제10조 (경기규칙)</h2>
          <p className="text-gray-700">본 대회는 「대한축구협회 8인제 경기규칙」과 「FIFA 경기규칙」을 준용하며, 특별한 사항은 대회운영본부(주최측)에서 결정한다.</p>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제11조 (대진, 경기방식, 일정의 결정)</h2>
          <div className="space-y-3 text-gray-700">
            <p>① 본 대회의 경기방식과 대진은 대회운영본부(주최측)에서 결정한다.</p>
            <p>② 경기일정은 경우 일몰 등 기후변화 및 경기장 상황, 기타 불가항력적인 상황에 따라 변경될 수 있다.</p>
            <p>③ 본 대회는 조별 4개팀 풀리그 방식으로 진행하며, 별도의 토너먼트와 단체상 시상은 진행하지 않는다.</p>
            <div className="ml-4 space-y-1 text-sm">
              <p>1. 1차 리그: 추첨으로 조 편성</p>
              <p>2. 2차 리그: 순위별 조 편성(1위팀 4팀/2위팀 4팀/3위팀 4팀/4위팀 4팀)</p>
            </div>
            <p>④ 참가팀수에 따라 조편성은 변경될 수 있으며, 변경 방식은 주최측에서 결정한다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제12조 (경기시간)</h2>
          <div className="space-y-3 text-gray-700">
            <p>① 경기 시간은 아래와 같다.</p>
            <div className="ml-4 space-y-1 text-sm">
              <p>1. 「전․후반 각 20분」이며, 연장전 및 승부차기는 진행하지 않는다.</p>
              <p>2. 하루에 팀당 2경기 이상 진행할 경우, 「전․후반 각 15분」 경기를 진행할 수 있다.</p>
            </div>
            <p>② 하프 타임 휴식 시간은 「10분 전.후」로 하되 15분을 초과하지 않으며, 원활한 경기 진행을 위해 대회운영본부(주최측)의 통제에 따라야 한다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 bg-blue-50">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제13조 (1차 리그 순위 결정방식)</h2>
          <div className="space-y-4 text-gray-700">
            <p>본 대회는 2차 리그 대진표 구성을 위해 1차 리그 조별 순위를 결정할 수 있으며, 방법은 아래와 같다.</p>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">1. 순위결정</h3>
              <p className="text-sm">승점 → 페어플레이점수(선수, 지도자, 임원) → 추첨[*추첨은 대회 주최측에서 진행한다.]</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">2. 승점 산정 방식</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>승: 3점</li>
                <li>무: 1점</li>
                <li>패: 0점</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">3. 페어플레이점수 산정 방식</h3>
              <p className="text-sm mb-2">※ 페어플레이 점수 부여 방식(회당 기준): 벌점 누계가 낮은 팀이 상위 순위에 위치함</p>
              
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <p className="font-medium">선수 벌점:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>경고 당 1점</li>
                    <li>경고 누적(2회) 퇴장: 3점</li>
                    <li>직접 퇴장: 3점</li>
                    <li>경고 1회 후 직접퇴장: 4점</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">지도자 및 임원 벌점:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>경고 당 2점</li>
                    <li>경고 누적(2회) 퇴장: 4점</li>
                    <li>직접 퇴장: 4점</li>
                    <li>경고 1회 후 직접퇴장: 6점</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">기타:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>페어플레이 점수는 선수 및 지도자, 임원 개인별로 각각 적용됨</li>
                    <li>공정소위원회에 의해 결정된 팀 경고: 6점</li>
                    <li>공정소위원회 결정 사항에 따라 경고 1점, 출전정지 1경기당 2점</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium">참고:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm mt-2">
                <li>2차 리그는 1차 리그 순위에 따라 조 편성 (1위팀 4팀/2위팀 4팀/3위팀 4팀/4위팀 4팀)</li>
                <li>1차 리그에서 발생한 경고는 2차 리그에 연계 적용하지 않으나, 퇴장 및 징계는 2차 리그에 연계 적용</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제14조 (벤치착석 및 지도행위)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>① 경기 중 벤치 착석은 대회 참가신청서에 기재된 「지도자, 임원, 선수관리담당자, 선수」에 한하며, 반드시 KFA등록증 또는 자격증을 패용하고 팀 벤치에 착석하여야 한다.</p>
            <p>② KFA 등록증은 대한축구협회 통합 온라인시스템(http://joinkfa.com)을 통해 팀에서 발급받아 사용하여야 한다.</p>
            <p>③ 경기감독관 확인 요청 시 「KFA등록증 또는 자격증」을 제시 하여야 한다.</p>
            <p>④ 대회 참가신청서에 기재된 지도자(감독, 코치)에 한하여 지도행위가 가능하며, 비정상적인 지도행위는 경기감독관 판단 하에 경기장에서 퇴장 조치할 수 있다.</p>
            <p>⑤ 징계 중인 지도자, 임원, 선수는 징계 종료일 다음 날부터 벤치에 착석할 수 있으며 징계 중인 지도자, 임원, 선수는 징계 기간 동안 팀 벤치, 선수대기실, 본부석 등 경기장 시설 내 입장이 불가하다.</p>
            <p>⑥ 벤치에 착석하는 대상은 선수의 복지와 안전, 전술적/코칭의 목적과 직접적으로 관련이 되어있는 경우에 한하여 소형, 이동식, 손에 휴대할 수 있는 장비를 사용할 수 있다.</p>
            <p>⑦ 본 규정에 명시되지 않은 사항은 KFA 8인제 기술발전 규정을 준용 한다.</p>
            <p>⑧ 벤치착석 인원은 코로나19 상황에 따라 변경될 수 있으며, 주최측에서 결정할 수 있다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제15조 (선수의 출전 및 장비)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>① 당일 경기에 참가하는 팀은 최소 경기개시 60분 전에 경기장에 도착함을 원칙으로 한다.</p>
            <p>② 경기에 참가하는 팀은 출전선수 명단을 대한축구협회 통합 온라인시스템 모바일 앱으로 접속하여 경기 개시 60분전까지 출전선수 18명 (선발출전 8명과 교체 대상선수 10명)의 명단을 제출(입력)하여야 한다.</p>
            <p>③ 경기에 출전하는 선수와 교체 대상선수는 소속팀의 본 대회 참가신청서 명단에 등록된 선수여야 한다.</p>
            <p>④ 경기에 출전하는 모든 선수는 반드시 KFA등록증을 의무적으로 지참하고, 경기 전 심판 또는 감독관에게 선수확인을 받아야 한다.</p>
            <p>⑤ 징계중인 선수는 징계 종료일 다음 날부터 출전 할 수 있다.</p>
            <p>⑥ 운영본부에 선수명단을 제출한 후에 출전선수 8명중 다른 선수로 교체 출전하고자 할 경우, 기 제출된 출전선수 8명과 교체 대상 선수 10명간에만 허용하며, 경기 개시 전까지 경기감독관 승인 하에 교체할 수 있다.</p>
            <p>⑦ 경기에 출전하는 선수의 상하 유니폼 번호가 반드시 참가신청서에 기재된 것과 동일해야 하며, 동일하지 않을 경우 해당선수는 참가신청서에 기재된 배번과 동일한 유니폼으로 갈아입고 해당 경기에 출전할 수 있다.</p>
            <p>⑧ 선수보호를 위해 반드시 정강이 보호대(Shin Guard)를 착용하고 경기에 출전하여야 한다.</p>
            <p>⑨ 주장 선수는 주장 완장을 부착하고 경기에 출전 하여야 한다.</p>
            <p>⑩ 경기출전 시 각 팀은 주/보조유니폼 2벌(각기 다른 색상의 스타킹 2족 포함)을 필히 지참해야 한다.</p>
            <p>⑪ 기능성 의류(타이즈 등)를 착용할 경우 규정에 따르며, 같은 팀 선수들은 반드시 같은 색상을 입어야 한다.</p>
            <p>⑫ 대회 참가팀은 정치적, 종교적, 개인적인 슬로건과 메시지, 광고 등을 노출해서는 안된다.</p>
            <p>⑬ 선수단의 EPTS 착용시 FIFA 승인된 업체의 장비로 대회의 주최(또는 주관) 단체에 공문으로 사전 승인 후 착용 가능하다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제16조 (선수 교체)</h2>
          <p className="text-gray-700">선수 교체는 경기 개시 전에 제출된 교체대상선수 10명과 선발선수 8명으로 수시 교체 가능하다.</p>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제17조 (재경기 실시)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>① 불가항력적인 사유(필드상황, 날씨, 정전에 의한 조명문제 등)로 인해 경기 중단 또는 진행이 불가능하게 된 경기를 「순연경기」라 하고, 순연된 경기의 개최를 「재경기」라 한다.</p>
            <p>② 득점차가 있을 때는 중단 시점에서부터 잔여시간만의 재경기를 갖는다.</p>
            <p>③ 득점차가 없을 때는 전.후반 경기를 새로 시작한다.</p>
            <p>④ 경고(2회 누적 포함), 퇴장, 징계 등 출전정지 대상자는 경기 순서대로 연계 적용한다.</p>
            <p>⑤ 재경기는 대회운영본부(주최측)가 결정하는 일시 및 장소에서 실시한다.</p>
            <p>⑥ 심판은 교체 배정할 수 있다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제18조 (팀, 임원 및 선수에 대한 제재)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>① 대회운영본부 「본 대회 공정소위원회」는 동 대회와 관련된 징계를 담당한다.</p>
            <p>② 「본 대회 공정소위원회」 긴급제재 기준은 &apos;KFA 유형별 긴급제재 징계 기준표&apos;에 따르며, 사안에 따라 협회 공정위원회 결정전까지 출전을 제한 할 수 있다.</p>
            <p>③ 퇴장당한 지도자, 선수 및 임원은 다음 1경기에 출전하지 못한다.</p>
            <p>④ 1차 리그에서 발생한 경고는 2차 리그에 연계 적용하지 않으나, 퇴장 및 징계는 2차 리그에 연계 적용한다.</p>
            <p>⑤ 긴급제재 및 징계중인 선수가 경기에 출전한 경우, 그 팀은 해당 경기(1경기)에 한하여 몰수 처리한다.</p>
            <p>⑥ 경기 중 또는 경기 후에라도 심각한 반칙 행위나 불법 행위가 적발될 경우 해당 팀, 임원(지도자 포함) 또는 선수에 대해 추가로 경기 출전정지 등을 「본 대회 공정소위원회」를 통해 결정한다.</p>
            <p>⑦ 참가신청서에 기재된 선수 중 출전 선수명단에 포함되지 않는 선수가 출전한 경우, 해당 선수는 기존 출전 선수와 즉시 재교체하여 경기를 진행하며 교체 허용 수는 감소하지 않는다.</p>
            <p>⑧ 참가신청서 명단에 없는 선수가 경기에 출전한 사실이 경기 중 또는 경기 후에 발각되었을 경우 그 팀의 모든 경기를 실격으로 처리한다.</p>
            <p>⑨ &apos;학교장확인서&apos;, &apos;학교폭력부존재서약서&apos; 미제출 선수가 경기에 출전한 사실이 경기중 또는 경기후에 발각되었을 경우 경기는 그대로 인정하며, 해당 팀은 「본 대회 공정소위원회」에 회부 된다.</p>
            <p>⑩ 규정에 명시된 교체선수 수를 초과하여 교체가 실시된 경우, 발각되는 즉시 해당 교체는 무효로 하고, 초과 교체로 교체 되어 나간 선수가 다시 경기에 출전하여야 하며 초과 교체로 출전한 선수는 벤치로 복귀하여야 한다.</p>
            <p>⑪ 팀 몰수 또는 실격 등으로 인한 상대팀 승점 및 스코어의 처리는 규정에 따라 정한다.</p>
            <p>⑫ 경기 도중 선수들을 터치라인 근처로 불러 모아 경기를 중단시키는 임원(지도자 포함)은 퇴장 조치하고, 잔여경기에 출전할 수 없다.</p>
            <p>⑬ 주심의 허락 없이 경기장에 무단 입장한 임원(지도자 포함)은 즉시 퇴장 조치하고, 잔여경기에 출전할 수 없다.</p>
            <p>⑭ 경기 중 심판판정 또는 기타 사유로 인해 집단으로 경기장 이탈, 지연, 경기에 불응하여 운영본부로부터 공식 경기재개 통보를 받은 후 3분 이내에 경기를 재개하지 않을 경우 출전포기(기권)로 간주하여 그 팀은 해당 경기(1경기)에 한하여 몰수 처리 한다.</p>
            <p>⑮ 경기 중 벤치 이외의 장소에서 팀을 지도할 수 없다.</p>
            <p>⑯ 경기 중 앰프(음향기기 일체)뿐만 아니라 각종 호각류, 레이저 빔 등 기타 경기진행 및 선수단 안전에 지장을 초래하거나, 협회에서 승인하지 않은 도구를 사용한 응원은 금지된다.</p>
            <p>⑰ 경기장 내에서 선수들 또는 팀 임원 사이의 전자 통신기기를 사용한 의사소통은 불가하다.</p>
            <p>⑱ 몰수 또는 실격팀과의 경기라 하더라도 득점, 경고, 퇴장 등 양 팀 선수 개인의 기록 및 실적은 인정한다.</p>
            <p>⑲ 경기 및 경기와 관련된 제반 사항에 대해 경기감독관은 영상 또는 사진촬영을 할 수 있으며, 경기감독관의 촬영을 방해하는 경우 「본 대회 공정소위원회」에 회부한다.</p>
            <p>⑳ 사진 촬영을 목적으로 하는 자는 경기감독관의 통제에 따라 지정된 장소에서 촬영하여야 하며, 불응시 경기감독관은 이를 제재할 권한을 가진다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제19조 (제소)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>① 규정 위반, 경기 중 불미스러운 행위 등 경기와 관련한 제소는 육하원칙에 의거하여 팀대표자 명의로 「공문과 관련 근거서류」를 첨부하여 대회운영본부로 제출해야 한다. 단, 제소는 해당 경기 종료후 48시간 이내에 하여야 하며, 경기 중의 제소는 원칙적으로는 허용하지 않는다.</p>
            <p>② 심판 판정에 대한 제소는 대상에서 제외함을 원칙으로 한다.</p>
            <p>③ 사실무근으로 제소하는 행위에 대해서는 「협회 공정소위원회」에 회부된다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제20조 (시상)</h2>
          <p className="text-gray-700">본 대회는 단체상 시상은 없으며, 경우에 따라 개인상만 시상할 수 있다.</p>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제21조 (선수단 안전 및 응급치료비 청구)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>① 대회에 참가하는 모든 선수는 참가팀에서 반드시 의료적으로 신체에 이상이 없는 선수(심장 질환 및 호흡기 질환 등 의료학적 이상이 없는 선수)를 출전시켜야 한다.</p>
            <p>② 문제가 발생할 경우 해당 팀에서 모든 책임을 감수하여야 한다.</p>
            <p>③ 참가팀은 의무적으로 선수 보호를 위한 보험에 가입하여야 한다.</p>
            <p>④ 기타 선수보호를 위한 안전대책을 강구 하여야 하며, 대회참가 시(경기 출전 시) 소속 선수들의 안전을 위해 경기 출전 전에 반드시 건강 상태 등을 점검 하여야 한다.</p>
            <p>⑤ 본 대회를 위해 스포츠안전재단에 상해 보험을 가입한 경우에는 별도의 부상치료비를 지급하지 않으며, 보험청구 방법 및 절차에 대해 추가 안내한다.</p>
            <p>⑥ 주최측은 경기관계자(선수, 지도자, 심판) 및 관중 보호를 위한 「미세먼지 발생에 따른 대회 운영지침」을 시행할 수 있다.</p>
            <p>⑦ 주최측은 선수 보호를 위해 「쿨링 브레이크」 제도를(워터타임) 시행할 수 있다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제22조 (기타 유의 사항)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>각 팀은 아래 사항을 숙지하고 실행하여야 한다.</p>
            <p>1. 당일 경기에 참가하는 팀은 최소 일정표상의 경기 개시 60분 전에 경기장에 도착함을 원칙으로 한다.</p>
            <p>2. 징계 중인 지도자는 지도행위를 금지하며, 이를 위반하였을 시 「협회 공정소위원회」에 회부한다.</p>
            <p>3. 참가팀은 페어플레이 정신에 입각하여 최선을 다해 모든 경기에 임해야 하며, 승부조작 등 어떠한 부정행위에 관여하거나 연루되지 않도록 노력해야 한다.</p>
            <p>4. 각 팀은 대회 기간 중 소속 선수의 개인기록(득점, 경고, 퇴장, 각종 출전불가 사항 등)에 대해 관리할 의무가 있으며, 출장 불가 대상자의 출전으로 인한 모든 책임은 해당 팀에게 있다.</p>
            <p>5. 본 대회의 사용구는 대회 주최 측이 결정한다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제23조 (도핑)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>① 도핑방지규정은 선수의 건강보호와 공정한 경기운영을 위함이며, 협회에 등록된 선수 및 지도자는 한국도핑방지위원회[www.kada-ad.or.kr]의 규정을 숙지하고 준수할 의무가 있다.</p>
            <p>② 대회기간 중 도핑검사를 목적으로 한국도핑방지위원회(이하 &apos;KADA&apos;)에서 불특정 지목 되어진 선수는 KADA에서 시행하는 도핑검사 절차를 반드시 준수해야 한다.</p>
            <p>③ 대회 전 또는 기간 중 치료를 위해 금지약물을 복용할 경우, KADA의 지침에 따라 해당 선수는 「치료목적사용면책(이하 &apos;TUE&apos;) 신청서」를 작성/제출해야 한다.</p>
            <p>④ 협회 등록 소속 선수 및 관계자는 항상 도핑을 방지할 의무가 있으며, 본 규정에 따라 KADA의 도핑검사 절차에 어떠한 방식으로도 관여할 수 없다.</p>
            <p>⑤ 도핑검사 후 금지물질이 검출 된 경우 KADA의 제재 조치를 따라야 한다.</p>
          </div>
        </section>

        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">제24조 (부칙)</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>① 본 대회규정에 명시되지 않은 사항은 추가로 대회운영본부(주최측)에서 결정 시행한다.</p>
            <p>② 대회운영본부는 참가팀 응원단의 위치를 배정할 수 있으며, 참가팀은 이에 적극 협조하여야 한다.</p>
            <p>③ 초등부 8인제 기술발전 규정을 준용한다.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
