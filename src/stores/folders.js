import { ref } from 'vue'

import sharedImg from '../assets/folders/shared.png'
import businessCardImg from '../assets/folders/business-card.png'
import appstoreImg from '../assets/folders/appstore.png'
import cherryQrImg from '../assets/folders/cherry-qr.png'
import cherryDesignImg from '../assets/folders/cherry-design.png'

// 모든 페이지에서 함께 사용할 폴더 목록
export const folderList = ref([
  {
    id: 1,
    name: '공유용',
    category: '기타',
    fileCount: 24,
    updatedAt: '2026.10.27',
    color: '#E9F2FF',
    thumbnail: sharedImg
  },
  {
    id: 2,
    name: '명함',
    category: '인쇄물',
    fileCount: 12,
    updatedAt: '2026.10.25',
    color: '#FFE9F0',
    thumbnail: businessCardImg
  },
  {
    id: 3,
    name: '앱스토어 이미지',
    category: 'GUI·UI',
    fileCount: 18,
    updatedAt: '2026.10.24',
    color: '#E9F6EE',
    thumbnail: appstoreImg
  },
  {
    id: 4,
    name: '체리 QR',
    category: '디자인 소스',
    fileCount: 8,
    updatedAt: '2026.10.22',
    color: '#FFF5D9',
    thumbnail: cherryQrImg
  },
  {
    id: 5,
    name: '기타 디자인',
    category: '기타',
    fileCount: 15,
    updatedAt: '2026.10.20',
    color: '#F1EAFF',
    thumbnail: cherryDesignImg
  }
])
