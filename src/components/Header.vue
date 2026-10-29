
<script setup>
import { ref } from 'vue'

// 로그인 기능 연결 전 임시 사용자 정보
const profileImage = ref('')
const userNickname = ref('체리 디자인팀')

// 추후 로그인 기능 연결 시
// 로그인한 사용자의 프로필 사진과 닉네임을 불러올 예정

import searchIcon from '../assets/icon/search.svg'
import bellIcon from '../assets/icon/bell.svg'
import clockIcon from '../assets/icon/clock.svg'
import settingIcon from '../assets/icon/setting.svg'
import chevronDown from '../assets/icon/chevron_2.svg'
import chevronDownOn from '../assets/icon/chevron_2_on.svg'
</script>
 
<template>
  <header class="top-header">

    <!-- 왼쪽 검색창 -->
    <div class="search-box">
      <img
        :src="searchIcon"
        alt=""
        class="search-icon"
      />

      <input
        type="text"
        placeholder="파일명, 태그, 프로젝트를 검색해 보세요."
      />
    </div>

    <!-- 오른쪽 버튼 그룹 -->
    <div class="header-actions">

      <!-- 알림 -->
      <button
        type="button"
        class="header-icon-btn"
        aria-label="알림"
        title="알림"
      >
        <img :src="bellIcon" alt="" />
      </button>

      <!-- 최근 활동 -->
      <button
        type="button"
        class="header-icon-btn"
        aria-label="최근 활동"
        title="최근 활동"
      >
        <img :src="clockIcon" alt="" />
      </button>

      <!-- 설정 -->
      <button
        type="button"
        class="header-icon-btn"
        aria-label="설정"
        title="설정"
      >
        <img :src="settingIcon" alt="" />
      </button>

      <!-- 구분선 -->
      <div class="header-divider"></div>

      <!-- 프로필 -->
      <button
        type="button"
        class="profile-button"
        title="계정 메뉴"
      >
        <div class="profile">
          <img
            v-if="profileImage"
            :src="profileImage"
            alt="프로필 사진"
            class="profile-image"
          />

          <svg
            v-else
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" fill="white" />
            <path
              d="M4 21C4 16.6 7.6 14 12 14C16.4 14 20 16.6 20 21"
              fill="white"
            />
          </svg>
        </div>

        <span class="profile-name">{{ userNickname }}</span>

        <!-- 기본 아래쪽 화살표 -->
        <img
          :src="chevronDown"
          alt=""
          class="profile-arrow-icon icon-off"
        />

        <!-- 마우스 호버 시 ON 화살표 -->
        <img
          :src="chevronDownOn"
          alt=""
          class="profile-arrow-icon icon-on"
        />
      </button>

    </div>
  </header>
</template>

<style scoped>
/* 상단 헤더 */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
}

/* 검색창 */
.search-box {
  flex: 0 1 60%;
  min-width: 180px;
}

/* 검색 아이콘 */
.search-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

/* 오른쪽 메뉴 그룹 */
.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
}

/* 아이콘 버튼 */
.header-icon-btn {
  width: 32px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.header-icon-btn img {
  width: 23px;
  height: 23px;
  object-fit: contain;
}

.header-icon-btn:hover {
  opacity: 0.65;
}

/* 구분선 */
.header-divider {
  width: 1px;
  height: 29px;
  background: #e6e9f0;
  margin: 0 4px;
}

/* 프로필 버튼 */
.profile-button {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #222;
}

/* 프로필 원 */
.profile {
  width: 42px;
  height: 42px;
  background: #ff5b82;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 프로필 이름 */
/* 프로필 이름 */
.profile-name {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.2s ease;
}

/* 프로필에 마우스를 올리면 닉네임도 핑크색 */
.profile-button:hover .profile-name {
  color: #ff366b;
}

/* 아래 화살표 */
.profile-arrow {
  font-size: 22px;
  line-height: 1;
  margin-left: 2px;
}

/* 좁은 화면 */
@media (max-width: 1050px) {
  .top-header {
    gap: 24px;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1 1 100%;
  }

  .header-actions {
    margin-left: auto;
  }
}

.profile-arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-left: 2px;
  flex-shrink: 0;
}

/* 기본 상태: OFF 화살표 표시 */
.profile-button .icon-off {
  display: block;
}

.profile-button .icon-on {
  display: none;
}

/* 프로필에 마우스를 올렸을 때: ON 화살표 표시 */
.profile-button:hover .icon-off {
  display: none;
}

.profile-button:hover .icon-on {
  display: block;
}
</style>
