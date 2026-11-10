
<script setup>
import {
  ref,
  onMounted,
  onUnmounted
} from 'vue'

import { useRouter } from 'vue-router'
import { searchQuery } from '../stores/search'
import { currentTheme, setTheme } from '../stores/theme'

import searchIcon from '../assets/icon/search.svg'
import bellIcon from '../assets/icon/bell.svg'
import clockIcon from '../assets/icon/clock.svg'
import settingIcon from '../assets/icon/setting.svg'
import chevronDown from '../assets/icon/chevron_2.svg'
import chevronDownOn from '../assets/icon/chevron_2_on.svg'

const router = useRouter()

// 임시 프로필 정보
const profileImage = ref('')
const userNickname = ref('체리 디자인팀')

// 드롭다운
const openDropdown = ref(null)
const settingsPage = ref('main')

const settingsArea = ref(null)
const profileArea = ref(null)

const emit = defineEmits([
  'settings-action',
  'profile-action'
])

function handleSearch() {
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

function closeDropdown() {
  openDropdown.value = null
  settingsPage.value = 'main'
}

function toggleDropdown(type) {
  if (openDropdown.value === type) {
    closeDropdown()
  } else {
    openDropdown.value = type
    settingsPage.value = 'main'
  }
}

function handleOutsideClick(event) {
  const isInsideSettings =
    settingsArea.value?.contains(event.target)

  const isInsideProfile =
    profileArea.value?.contains(event.target)

  if (!isInsideSettings && !isInsideProfile) {
    closeDropdown()
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

function selectSettingsAction(action) {
  if (action === 'appearance') {
    settingsPage.value = 'appearance'
    return
  }

  closeDropdown()
  emit('settings-action', action)
}

function selectProfileAction(action) {
  closeDropdown()
  emit('profile-action', action)
}

// 실제 테마 변경
function handleThemeChange(theme) {
  setTheme(theme)
  closeDropdown()
}

onMounted(() => {
  document.addEventListener(
    'pointerdown',
    handleOutsideClick
  )

  document.addEventListener(
    'keydown',
    handleKeydown
  )
})

onUnmounted(() => {
  document.removeEventListener(
    'pointerdown',
    handleOutsideClick
  )

  document.removeEventListener(
    'keydown',
    handleKeydown
  )
})
</script>

<template>
  <header class="top-header">

    <!-- 기존 검색 -->
    <div class="search-box">
      <img
        :src="searchIcon"
        alt=""
        class="search-icon"
      />

      <input
        v-model="searchQuery"
        type="search"
        aria-label="디자인 자료 검색"
        placeholder="파일명, 태그, 프로젝트를 검색해 보세요."
        @input="handleSearch"
      />
    </div>

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
      <div
        ref="settingsArea"
        class="dropdown-wrapper"
        :class="{
          'dropdown-open': openDropdown === 'settings'
        }"
      >
        <button
          type="button"
          class="header-icon-btn"
          :class="{
            'icon-btn-active':
              openDropdown === 'settings'
          }"
          aria-label="설정"
          title="설정"
          aria-haspopup="menu"
          :aria-expanded="
            openDropdown === 'settings'
          "
          @click.stop="toggleDropdown('settings')"
        >
          <img :src="settingIcon" alt="" />
        </button>

        <div
          v-if="openDropdown === 'settings'"
          class="header-dropdown settings-dropdown"
          role="menu"
          aria-label="설정 메뉴"
          @click.stop
        >
          <!-- 설정 메인 -->
          <template v-if="settingsPage === 'main'">
            <div class="dropdown-heading">
              <strong>설정</strong>
            </div>

            <div class="dropdown-divider"></div>

            <button
              type="button"
              class="dropdown-item"
              role="menuitem"
              @click="selectSettingsAction('notifications')"
            >
              <span class="menu-icon">
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
                  <path d="M10 21h4"/>
                </svg>
              </span>

              <span class="menu-item-text">
                <strong>알림 설정</strong>
                <small>알림 수신 및 표시 관리</small>
              </span>

              <span class="menu-chevron">›</span>
            </button>

            <button
              type="button"
              class="dropdown-item"
              role="menuitem"
              @click="selectSettingsAction('appearance')"
            >
              <span class="menu-icon">
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 3a9 9 0 0 1 0 18"/>
                </svg>
              </span>

              <span class="menu-item-text">
                <strong>화면 설정</strong>
                <small>
                  {{ currentTheme === 'dark'
                    ? '현재 다크 모드'
                    : '현재 화이트 모드' }}
                </small>
              </span>

              <span class="menu-chevron">›</span>
            </button>

            <button
              type="button"
              class="dropdown-item"
              role="menuitem"
              @click="selectSettingsAction('preferences')"
            >
              <span class="menu-icon">
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 7h16M4 17h16"/>
                  <circle cx="9" cy="7" r="2"/>
                  <circle cx="16" cy="17" r="2"/>
                </svg>
              </span>

              <span class="menu-item-text">
                <strong>기본 환경 설정</strong>
                <small>기본 보기 및 사용 환경</small>
              </span>

              <span class="menu-chevron">›</span>
            </button>

            <div class="dropdown-divider"></div>

            <button
              type="button"
              class="dropdown-item compact-item"
              role="menuitem"
              @click="selectSettingsAction('help')"
            >
              <span class="menu-icon">
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.8.9-1.9 1.2-1.9 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </span>

              <span class="menu-item-text">
                <strong>도움말</strong>
              </span>

              <span class="menu-chevron">›</span>
            </button>
          </template>

          <!-- 화면 설정 상세 -->
          <template v-else-if="settingsPage === 'appearance'">
            <div class="appearance-heading">
              <button
                type="button"
                class="back-button"
                aria-label="설정으로 돌아가기"
                @click="settingsPage = 'main'"
              >
                ‹
              </button>

              <strong>화면 설정</strong>
            </div>

            <div class="dropdown-divider"></div>

            <p class="appearance-description">
              원하는 화면 테마를 선택해 주세요.
            </p>

            <!-- 화이트 모드 -->
            <button
              type="button"
              class="theme-option"
              :class="{
                'theme-selected': currentTheme === 'light'
              }"
              role="menuitemradio"
              :aria-checked="currentTheme === 'light'"
              @click="handleThemeChange('light')"
            >
              <span class="theme-icon light-icon">
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>
                </svg>
              </span>

              <span class="theme-option-text">
                <strong>화이트 모드</strong>
                <small>밝고 깔끔한 기본 화면</small>
              </span>

              <span
                class="theme-radio"
                :class="{ checked: currentTheme === 'light' }"
              >
                <span v-if="currentTheme === 'light'"></span>
              </span>
            </button>

            <!-- 다크 모드 -->
            <button
              type="button"
              class="theme-option"
              :class="{
                'theme-selected': currentTheme === 'dark'
              }"
              role="menuitemradio"
              :aria-checked="currentTheme === 'dark'"
              @click="handleThemeChange('dark')"
            >
              <span class="theme-icon dark-icon">
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>
                </svg>
              </span>

              <span class="theme-option-text">
                <strong>다크 모드</strong>
                <small>눈부심을 줄인 어두운 화면</small>
              </span>

              <span
                class="theme-radio"
                :class="{ checked: currentTheme === 'dark' }"
              >
                <span v-if="currentTheme === 'dark'"></span>
              </span>
            </button>

            <div class="appearance-footer">
              선택한 테마는 자동으로 저장됩니다.
            </div>
          </template>
        </div>
      </div>

      <!-- 구분선 -->
      <div class="header-divider"></div>

      <!-- 프로필 -->
      <div
        ref="profileArea"
        class="dropdown-wrapper profile-wrapper"
        :class="{
          'dropdown-open': openDropdown === 'profile'
        }"
      >
        <button
          type="button"
          class="profile-button"
          :class="{
            'profile-active':
              openDropdown === 'profile'
          }"
          aria-label="계정 메뉴"
          title="계정 메뉴"
          aria-haspopup="menu"
          :aria-expanded="
            openDropdown === 'profile'
          "
          @click.stop="toggleDropdown('profile')"
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
              <circle cx="12" cy="8" r="4" fill="white"/>
              <path
                d="M4 21C4 16.6 7.6 14 12 14C16.4 14 20 16.6 20 21"
                fill="white"
              />
            </svg>
          </div>

          <span class="profile-name">
            {{ userNickname }}
          </span>

          <img
            :src="chevronDown"
            alt=""
            class="profile-arrow-icon icon-off"
          />

          <img
            :src="chevronDownOn"
            alt=""
            class="profile-arrow-icon icon-on"
          />
        </button>

        <!-- 프로필 메뉴 -->
        <div
          v-if="openDropdown === 'profile'"
          class="header-dropdown profile-dropdown"
          role="menu"
          aria-label="프로필 메뉴"
          @click.stop
        >
          <div class="profile-menu-user">
            <div class="profile menu-profile">
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
                <circle cx="12" cy="8" r="4" fill="white"/>
                <path
                  d="M4 21C4 16.6 7.6 14 12 14C16.4 14 20 16.6 20 21"
                  fill="white"
                />
              </svg>
            </div>

            <div class="profile-menu-info">
              <strong>{{ userNickname }}</strong>
              <small>현재 계정</small>
            </div>
          </div>

          <div class="dropdown-divider"></div>

          <button
            type="button"
            class="dropdown-item compact-item"
            role="menuitem"
            @click="selectProfileAction('account-settings')"
          >
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </span>

            <span class="menu-item-text">
              <strong>계정 설정</strong>
            </span>

            <span class="menu-chevron">›</span>
          </button>

          <button
            type="button"
            class="dropdown-item compact-item"
            role="menuitem"
            @click="selectProfileAction('switch-account')"
          >
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 7h15m-4-4 4 4-4 4"/>
                <path d="M20 17H5m4-4-4 4 4 4"/>
              </svg>
            </span>

            <span class="menu-item-text">
              <strong>계정 전환</strong>
            </span>

            <span class="menu-chevron">›</span>
          </button>

          <div class="dropdown-divider"></div>

          <button
            type="button"
            class="dropdown-item compact-item logout-item"
            role="menuitem"
            @click="selectProfileAction('logout')"
          >
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/>
                <path d="M14 16l4-4-4-4M8 12h10"/>
              </svg>
            </span>

            <span class="menu-item-text">
              <strong>로그아웃</strong>
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* =====================================
   기존 헤더 레이아웃
===================================== */

.top-header {
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  overflow: visible;
}

.search-box {
  flex: 0 1 60%;
  min-width: 180px;
}

.search-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
}

.header-icon-btn {
  width: 32px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: background .2s, opacity .2s;
}

.header-icon-btn img {
  width: 23px;
  height: 23px;
  object-fit: contain;
}

.header-icon-btn:hover {
  opacity: .65;
}

.header-icon-btn.icon-btn-active {
  background: var(--ch-pink-soft, #fff0f4);
}

.header-icon-btn.icon-btn-active:hover {
  opacity: 1;
}

.header-divider {
  width: 1px;
  height: 29px;
  background: var(--ch-border, #e6e9f0);
  margin: 0 4px;
}

/* =====================================
   프로필
===================================== */

.profile-button {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ch-text, #222);
}

.profile {
  width: 42px;
  height: 42px;
  background: #ff5b82;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  transition: color .2s ease;
  color: var(--ch-text, #222);
}

.profile-button:hover .profile-name,
.profile-button.profile-active .profile-name {
  color: var(--ch-pink, #ff366b);
}

.profile-arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-left: 2px;
  flex-shrink: 0;
}

.profile-button .icon-off {
  display: block;
}

.profile-button .icon-on {
  display: none;
}

.profile-button:hover .icon-off,
.profile-button.profile-active .icon-off {
  display: none;
}

.profile-button:hover .icon-on,
.profile-button.profile-active .icon-on {
  display: block;
}

/* =====================================
   드롭다운 공통
===================================== */

.dropdown-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 1;
}

.dropdown-wrapper.dropdown-open {
  z-index: 300;
}

.header-dropdown {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  z-index: 301;
  width: 286px;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid var(--ch-border, #e8ebf1);
  border-radius: 15px;
  background: var(--ch-surface, #fff);
  box-shadow: var(--ch-shadow, 0 12px 35px rgba(30, 40, 65, .13));
  color: var(--ch-text, #30394a);
  white-space: normal;
}

.dropdown-heading {
  padding: 13px 13px 12px;
}

.dropdown-heading strong {
  color: var(--ch-text-strong, #252b38);
  font-size: 15px;
  font-weight: 700;
}

.dropdown-divider {
  height: 1px;
  margin: 5px 7px;
  background: var(--ch-border, #eef0f5);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 58px;
  box-sizing: border-box;
  padding: 10px 11px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--ch-text, #30394a);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background .15s, color .15s;
}

.dropdown-item:hover {
  background: var(--ch-pink-soft, #fff0f4);
}

.menu-icon {
  width: 21px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--ch-text-muted, #8793a6);
}

.menu-icon svg {
  width: 20px;
  height: 20px;
}

.menu-item-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item-text strong {
  color: var(--ch-text, #30394a);
  font-size: 13px;
  font-weight: 600;
}

.menu-item-text small {
  color: var(--ch-text-muted, #9ba5b6);
  font-size: 11px;
  line-height: 1.4;
}

.menu-chevron {
  flex-shrink: 0;
  font-size: 22px;
  line-height: 1;
  color: var(--ch-text-muted, #b5bdca);
}

.dropdown-item:hover .menu-icon,
.dropdown-item:hover .menu-item-text strong,
.dropdown-item:hover .menu-chevron {
  color: var(--ch-pink, #ff366b);
}

.dropdown-item.compact-item {
  min-height: 43px;
  padding: 11px;
}

/* =====================================
   화면 설정 하위 메뉴
===================================== */

.appearance-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 10px;
}

.appearance-heading strong {
  color: var(--ch-text-strong, #252b38);
  font-size: 15px;
  font-weight: 700;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--ch-text, #30394a);
  font-size: 27px;
  cursor: pointer;
}

.back-button:hover {
  background: var(--ch-surface-soft, #f7f8fb);
}

.appearance-description {
  margin: 13px 11px 13px;
  color: var(--ch-text-muted, #9ba5b6);
  font-size: 12px;
  line-height: 1.5;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 66px;
  padding: 11px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.theme-option + .theme-option {
  margin-top: 5px;
}

.theme-option:hover {
  background: var(--ch-surface-soft, #f7f8fb);
}

.theme-option.theme-selected {
  border-color: var(--ch-pink, #ff366b);
  background: var(--ch-pink-soft, #fff0f4);
}

.theme-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 37px;
  height: 37px;
  border-radius: 9px;
  flex-shrink: 0;
}

.theme-icon svg {
  width: 20px;
  height: 20px;
}

.light-icon {
  color: #e59b2c;
  background: #fff2d9;
}

.dark-icon {
  color: #bdc7eb;
  background: #303b58;
}

.theme-option-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.theme-option-text strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--ch-text-strong, #30394a);
}

.theme-option-text small {
  font-size: 11px;
  color: var(--ch-text-muted, #9ba5b6);
}

.theme-radio {
  width: 17px;
  height: 17px;
  box-sizing: border-box;
  border: 1.5px solid var(--ch-border-strong, #cbd2df);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.theme-radio.checked {
  border-color: var(--ch-pink, #ff366b);
}

.theme-radio.checked span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ch-pink, #ff366b);
}

.appearance-footer {
  margin-top: 12px;
  padding: 12px 9px 5px;
  border-top: 1px solid var(--ch-border, #eef0f5);
  color: var(--ch-text-muted, #9ba5b6);
  font-size: 11px;
  text-align: center;
}

/* =====================================
   프로필 드롭다운
===================================== */

.profile-dropdown {
  width: 266px;
}

.profile-menu-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
}

.menu-profile {
  width: 40px;
  height: 40px;
}

.profile-menu-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.profile-menu-info strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--ch-text-strong, #30394a);
}

.profile-menu-info small {
  font-size: 11px;
  color: var(--ch-text-muted, #9ba5b6);
}

.logout-item .menu-icon,
.logout-item .menu-item-text strong {
  color: #f04460;
}

.logout-item:hover {
  background: var(--ch-pink-soft, #fff1f2);
}

/* =====================================
   반응형
===================================== */

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

@media (max-width: 600px) {
  .header-actions {
    gap: 8px;
  }

  .profile-button {
    gap: 7px;
  }

  .profile-name {
    font-size: 12px;
  }

  .header-dropdown {
    width: 260px;
  }

  .profile-dropdown {
    width: 245px;
  }
}
</style>
