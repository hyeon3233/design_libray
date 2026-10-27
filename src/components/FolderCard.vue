
<script setup>
import { computed, ref } from 'vue'

// 카드마다 고유한 그라데이션 ID 생성
const gradientId = ref(
  `folder-${Math.random().toString(36).slice(2, 10)}`
)

// 부모 컴포넌트에서 전달받는 데이터
const props = defineProps({
  name: String,
  category: String,
  fileCount: Number,
  updatedAt: String,
  thumbnail: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#E9F2FF'
  }
})

// 폴더별 색상 설정
const folderColor = computed(() => {
  const colors = {
    '#E9F2FF': ['#80C9FF', '#42A9F5'],
    '#FFE9F0': ['#FFADC5', '#FF72A1'],
    '#E9F6EE': ['#81E6C2', '#37CDA0'],
    '#FFF5D9': ['#FFD976', '#FFB92E'],
    '#F1EAFF': ['#C4A5FF', '#9167EA']
  }

  return colors[props.color] || colors['#E9F2FF']
})
</script>

<template>
  <article class="folder-card">

    <!-- 폴더 썸네일 -->
    <div
      class="folder-thumbnail"
      :style="{ backgroundColor: color }"
    >
      <svg
        class="folder-icon"
        viewBox="0 0 100 85"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            :id="gradientId"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              :stop-color="folderColor[0]"
            />
            <stop
              offset="100%"
              :stop-color="folderColor[1]"
            />
          </linearGradient>
        </defs>

        <!-- 폴더 뒷면 -->
        <path
          d="M8 20 Q8 12 16 12 H38 L48 22 H84 Q92 22 92 30 V70 Q92 78 84 78 H16 Q8 78 8 70 Z"
          :fill="`url(#${gradientId})`"
        />

        <!-- 폴더 앞면 -->
        <path
          d="M8 35 Q8 29 15 29 H85 Q92 29 92 36 V70 Q92 78 84 78 H16 Q8 78 8 70 Z"
          :fill="folderColor[1]"
          opacity="0.9"
        />
      </svg>
      <img
        v-if="thumbnail"
        :src="thumbnail"
        alt="`${name} 디자인 미리보기`"
        class="folder-preview"
        />
    </div>

    <!-- 폴더 정보 -->
    <div class="folder-info">

      <!-- 폴더 이름 및 더보기 -->
      <div class="folder-title-row">
        <h3>{{ name }}</h3>

        <button
          class="more-btn"
          type="button"
          :aria-label="`${name} 메뉴`"
        >
          ⋯
        </button>
      </div>

      <!-- 카테고리 태그 -->
      <span class="folder-category">
        {{ category }}
      </span>

      <!-- 파일 개수 및 수정일 -->
      <div class="folder-bottom">
        <span>{{ fileCount }}개 파일</span>
        <span>{{ updatedAt }}</span>
      </div>

    </div>
  </article>
</template>

<style scoped>
/* 폴더 카드 */
.folder-card {
  min-width: 0;
  background: #ffffff;
  border: 1px solid #edf0f5;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.folder-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

/* 폴더 썸네일 */
.folder-thumbnail {
  height: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 컬러 폴더 아이콘 */
.folder-icon {
  width: 90px;
  height: 80px;
  filter: drop-shadow(
    0 5px 5px rgba(0, 0, 0, 0.08)
  );
}

/* 폴더 정보 */
.folder-info {
  padding: 15px;
}

/* 제목 영역 */
.folder-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.folder-title-row h3 {
  font-size: 15px;
  font-weight: 600;
  color: #252b38;
  margin: 0;
  min-width: 0;
  word-break: keep-all;
  overflow-wrap: break-word;
  line-height: 1.5;
}

/* 더보기 버튼 */
.more-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #a0a8b8;
  font-size: 22px;
  cursor: pointer;
}

.more-btn:hover {
  color: #ff366b;
}

/* 카테고리 태그 */
.folder-category {
  display: inline-block;
  margin-top: 10px;
  padding: 5px 9px;
  background: #f5f6f9;
  color: #8994a8;
  border-radius: 6px;
  font-size: 13px;
}

/* 파일 수 및 수정일 */
.folder-bottom {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  color: #a2aaba;
}

.folder-thumbnail {
  gap: 10px;
  padding: 12px;
  overflow: hidden;
}

.folder-icon {
  width: 38%;
  height: 80px;
  flex-shrink: 0;
}

.folder-preview {
  width: 58%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
