
import { computed } from 'vue'
import { folderList } from './folders'
import { uploadedFiles } from './uploadedFiles'

import posterImg from '../assets/recent/poster.png'
import businessImg from '../assets/recent/business-card.png'
import appstoreImg from '../assets/recent/appstore.png'
import bannerImg from '../assets/recent/banner.png'
import goodsImg from '../assets/recent/goods.png'
import snsImg from '../assets/recent/sns.png'

// 홈에 기본으로 표시할 파일 6개
export const homeRecentAssets = [
  {
    id: 101,
    folderId: null,
    name: '브랜드 포스터',
    type: 'IMG',
    size: '',
    thumbnail: posterImg,
    tags: ['포스터', '브랜딩'],
    uploadedAt: '2026.10.27'
  },
  {
    id: 102,
    folderId: null,
    name: '명함 디자인',
    type: 'IMG',
    size: '',
    thumbnail: businessImg,
    tags: ['명함', '인쇄물'],
    uploadedAt: '2026.10.26'
  },
  {
    id: 103,
    folderId: null,
    name: '앱스토어 이미지',
    type: 'IMG',
    size: '',
    thumbnail: appstoreImg,
    tags: ['GUI·UI'],
    uploadedAt: '2026.10.25'
  },
  {
    id: 104,
    folderId: null,
    name: '프로모션 배너',
    type: 'IMG',
    size: '',
    thumbnail: bannerImg,
    tags: ['배너', '홍보물'],
    uploadedAt: '2026.10.24'
  },
  {
    id: 105,
    folderId: null,
    name: '굿즈 디자인',
    type: 'IMG',
    size: '',
    thumbnail: goodsImg,
    tags: ['굿즈'],
    uploadedAt: '2026.10.23'
  },
  {
    id: 106,
    folderId: null,
    name: 'SNS 카드뉴스',
    type: 'IMG',
    size: '',
    thumbnail: snsImg,
    tags: ['SNS', '카드뉴스'],
    uploadedAt: '2026.10.22'
  }
]

// 명함 폴더에 있는 파일 12개
const businessCardFiles = [
  { id: 1, name: '체리 명함 시안 01', type: 'AI', size: '3.2MB', uploadedAt: '2026.10.28', updatedAt: null, color: '#FFE8EF' },
  { id: 2, name: '체리 명함 시안 02', type: 'PSD', size: '8.4MB', uploadedAt: '2026.10.20', updatedAt: '2026.10.27', color: '#FCE5F0' },
  { id: 3, name: '체리 명함 시안 03', type: 'PNG', size: '1.8MB', uploadedAt: '2026.10.27', updatedAt: null, color: '#F7E9F2' },
  { id: 4, name: '명함 목업 이미지', type: 'JPG', size: '2.1MB', uploadedAt: '2026.10.26', updatedAt: null, color: '#F4E9E6' },
  { id: 5, name: '로고 버전 명함', type: 'AI', size: '4.5MB', uploadedAt: '2026.10.22', updatedAt: '2026.10.25', color: '#FBE6EE' },
  { id: 6, name: '명함 일러스트', type: 'AI', size: '3.7MB', uploadedAt: '2026.10.24', updatedAt: null, color: '#EAF2FD' },
  { id: 7, name: '명함 배경 패턴', type: 'PNG', size: '1.3MB', uploadedAt: '2026.10.23', updatedAt: null, color: '#F5E9FF' },
  { id: 8, name: '행사 명함', type: 'PDF', size: '2.6MB', uploadedAt: '2026.10.22', updatedAt: null, color: '#FFF1DE' },
  { id: 9, name: '명함 시안 04', type: 'PSD', size: '5.2MB', uploadedAt: '2026.10.18', updatedAt: '2026.10.21', color: '#E9F6EE' },
  { id: 10, name: '명함 시안 05', type: 'AI', size: '4.1MB', uploadedAt: '2026.10.20', updatedAt: null, color: '#FFE7EB' },
  { id: 11, name: '명함 시안 06', type: 'PNG', size: '1.7MB', uploadedAt: '2026.10.19', updatedAt: null, color: '#EEE8FA' },
  { id: 12, name: '명함 시안 07', type: 'JPG', size: '2.4MB', uploadedAt: '2026.10.18', updatedAt: null, color: '#F8E8F0' }
]

// 전체 파일


// 기존 샘플 파일 + 실제 업로드한 파일
export const allFiles = computed(() => [
  ...businessCardFiles.map(file => ({
    ...file,
    folderId: 2,
    tags: ['명함', '인쇄물'],
    thumbnail: ''
  })),

  ...homeRecentAssets,

  ...uploadedFiles.value
])



// 최근 업로드 순 정렬
export const recentFiles = computed(() =>
  [...allFiles.value].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt)
  )
)

// 검색 함수
export function searchFiles(
  query,
  category = '전체',
  aliases = {}
) {
  const keyword = query.trim().toLowerCase()
  const categoryTerms = aliases[category] || []

  return recentFiles.value.filter(file => {
    const folderName = folderList.value.find(
      folder => folder.id === file.folderId
    )?.name || ''

    const searchableText = [
      file.name,
      file.type,
      folderName,
      ...(file.tags || [])
    ].join(' ').toLowerCase()

    const matchesSearch =
      !keyword || searchableText.includes(keyword)

    const matchesCategory =
      category === '전체' ||
      file.tags?.some(tag =>
        categoryTerms.includes(tag)
      )

    return matchesSearch && matchesCategory
  })
}
