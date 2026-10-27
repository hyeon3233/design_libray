<script setup>
defineProps({
  title: String,
  thumbnail: String,
  tags: {
    type: Array,
    default: () => []
  },
  updatedAt: String,
  author: {
    type: String,
    default: '나'
  }
})
</script>

<template>
  <article class="asset-card">
    <!-- 이미지 미리보기 -->
    <div class="asset-thumbnail">
      <img
        v-if="thumbnail"
        :src="thumbnail"
        :alt="title"
      />
      <span v-else>이미지 미리보기</span>
    </div>

    <!-- 파일 이름 -->
    <div class="asset-title">
      <h3>{{ title }}</h3>
      <button type="button" class="more-btn">⋯</button>
    </div>

    <!-- 태그 -->
    <div class="asset-tags">
      <span
        v-for="tag in tags"
        :key="tag"
        class="asset-tag"
      >
        {{ tag }}
      </span>
    </div>

    <!-- 업로드한 디자이너 / 수정일 -->
        <div class="asset-bottom">
     <div class="author">
      <span class="avatar">C</span>
     <span>{{ author }}</span>
    </div>

    <span>{{ updatedAt }}</span>
</div>
  </article>
</template>

<style scoped>
.asset-card {
  min-width: 0;
  background: #fff;
}

.asset-thumbnail {
  width: 100%;
  aspect-ratio: 1.7 / 1;
  background: #f2f3f7;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca6ba;
  font-size: 12px;
}

.asset-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.asset-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
}

.asset-title h3 {
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: #18243c;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-btn {
  border: none;
  background: none;
  color: #8494b2;
  font-size: 20px;
  cursor: pointer;
}

.asset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}

.asset-tag {
  background: #f2f4f8;
  color: #7182a1;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
}

.asset-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 13px;
  color: #8c9ab4;
}

.author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8952d7;
  color: white;
  font-size: 10px;
  font-weight: 700;
}

.asset-date {
  font-size: 13px;
  font-weight: 500;
  color: #7b89a5;
  white-space: nowrap;
}
</style>
