<template>
  <Teleport to="body">
    <Transition @enter="onMaskEnter" @leave="onMaskLeave">
      <div v-if="visible" class="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm">
        <!-- 右上角关闭 -->
        <button
          type="button"
          class="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl z-20 transition-colors"
          aria-label="关闭"
          @click="closeModal"
        >
          ✕
        </button>

        <div class="flex-1 flex items-center justify-center p-8">
          <!-- 阶段1：单槽飞速轮播（名字/内容快速切换） -->
          <div
            v-if="phase === 'shuffling'"
            class="relative z-10 flex flex-col items-center"
          >
            <div
              class="w-48 h-72 md:w-56 md:h-80 border-4 border-amber-500/50 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-800/90 shadow-[0_0_50px_rgba(234,179,8,0.25)]"
            >
              <span class="text-amber-400 text-2xl md:text-3xl font-black text-center px-4 animate-pulse">
                {{ currentRollText }}
              </span>
            </div>
            <p class="text-amber-400/80 mt-6 tracking-widest font-light">正在锁定...</p>
          </div>

          <!-- 阶段2：三张卡牌，点击选择后翻牌 + 选中高亮 -->
          <div
            v-if="phase === 'selecting'"
            class="relative z-10 flex flex-col items-center w-full max-w-4xl"
          >
            <h2 class="text-white text-lg md:text-xl mb-10 tracking-wide font-light">请点击选择一张卡牌</h2>
            <div class="flex gap-4 md:gap-10 perspective-1000">
              <div
                v-for="(card, index) in displayCards"
                :key="index"
                :ref="(el) => setCardRef(el as HTMLElement, index)"
                class="card-container w-36 h-52 md:w-48 md:h-64 cursor-pointer relative flex-shrink-0"
                @click="handleSelect(index)"
              >
                <div
                  class="card-inner w-full h-full relative"
                  :class="{ 'is-flipped': isFlipped }"
                >
                  <!-- 正面：问号 -->
                  <div
                    class="card-front absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl border-2 border-amber-500/50 flex items-center justify-center shadow-xl"
                  >
                    <span class="text-amber-400 text-4xl md:text-5xl font-serif">?</span>
                  </div>
                  <!-- 背面：内容 -->
                  <div
                    class="card-back absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center p-3 shadow-lg"
                    :class="backClass(card)"
                  >
                    <template v-if="mode === 'draw-person'">
                      <div class="text-xs text-gray-500 mb-1 uppercase tracking-tight">选中</div>
                      <div class="text-xl md:text-2xl font-bold text-gray-800 text-center">{{ getCardName(card) }}</div>
                    </template>
                    <template v-else>
                      <div
                        class="text-xs font-medium mb-1 uppercase tracking-tight"
                        :class="isRewardMode ? 'text-green-600' : 'text-red-600'"
                      >
                        {{ isRewardMode ? '奖励' : '惩罚' }}
                      </div>
                      <div class="text-sm md:text-base text-gray-800 text-center break-words line-clamp-4">
                        {{ getCardText(card) }}
                      </div>
                    </template>
                    <div class="mt-3 w-10 h-0.5 rounded" :class="isRewardMode ? 'bg-green-500' : 'bg-red-500'" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { getPartyPersonnel, getPartyRewardsPunishments } from '../utils/storageUtils'
import type { PartyPersonnelItem, PartyRewardPunishmentItem } from '../utils/storageUtils'

const props = defineProps<{
  mode: 'draw-person' | 'reward-only' | 'punishment-only'
}>()

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)
const phase = ref<'shuffling' | 'selecting'>('shuffling')
const currentRollText = ref('')
const isFlipped = ref(false)
const displayCards = ref<(PartyPersonnelItem | PartyRewardPunishmentItem)[]>([])
const cardRefs = ref<(HTMLElement | null)[]>([])

function setCardRef(el: HTMLElement | null, index: number) {
  if (el != null) cardRefs.value[index] = el
}

const isRewardMode = computed(() => props.mode === 'reward-only')

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getRollSource(): string[] {
  if (props.mode === 'draw-person') {
    return getPartyPersonnel().map((p) => p.name)
  }
  const list = getPartyRewardsPunishments().filter(
    (i) => i.type === (props.mode === 'reward-only' ? 'reward' : 'punishment')
  )
  return list.map((i) => i.text)
}

function sampleThree() {
  if (props.mode === 'draw-person') {
    const list = getPartyPersonnel()
    displayCards.value = shuffle(list).slice(0, 3)
  } else {
    const list = getPartyRewardsPunishments()
    const filtered = list.filter((i) => i.type === (props.mode === 'reward-only' ? 'reward' : 'punishment'))
    displayCards.value = shuffle(filtered).slice(0, 3)
  }
}

function getCardName(card: PartyPersonnelItem | PartyRewardPunishmentItem): string {
  return (card as PartyPersonnelItem).name
}
function getCardText(card: PartyPersonnelItem | PartyRewardPunishmentItem): string {
  return (card as PartyRewardPunishmentItem).text
}
function backClass(card: PartyPersonnelItem | PartyRewardPunishmentItem): string {
  if (props.mode === 'draw-person') return 'bg-white border-amber-500/50'
  const c = card as PartyRewardPunishmentItem
  return c.type === 'reward'
    ? 'bg-green-50 border-green-400/60'
    : 'bg-red-50 border-red-400/60'
}

function runShuffling() {
  const source = getRollSource()
  if (source.length === 0) source.push('?')
  const maxRolls = 28
  let count = 0
  const interval = setInterval(() => {
    currentRollText.value = source[Math.floor(Math.random() * source.length)]
    count++
    if (count >= maxRolls) {
      clearInterval(interval)
      enterSelectingPhase()
    }
  }, 70)
}

function enterSelectingPhase() {
  sampleThree()
  phase.value = 'selecting'
  nextTick(() => {
    const els = cardRefs.value.filter((e): e is HTMLElement => e != null)
    if (els.length) {
      gsap.fromTo(
        els,
        {
          y: 80,
          opacity: 0,
          scale: 0.3,
          rotationX: -50
        },
        {
          duration: 0.75,
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          stagger: 0.12,
          ease: 'back.out(1.4)',
          overwrite: true
        }
      )
    }
  })
}

function handleSelect(index: number) {
  if (isFlipped.value) return
  // 先让三张都翻牌（背面朝上 → 翻过来显示内容）
  isFlipped.value = true
  const els = cardRefs.value.filter((e): e is HTMLElement => e != null)
  // 翻牌动画约 0.6s，结束后再高亮选中、弱化未选中
  setTimeout(() => {
    els.forEach((el, i) => {
      if (i === index) {
        el.classList.add('selected-winner')
        gsap.to(el, {
          scale: 1.12,
          duration: 0.5,
          zIndex: 100,
          ease: 'power2.out'
        })
      } else {
        gsap.to(el, {
          opacity: 0.55,
          scale: 0.92,
          duration: 0.5,
          filter: 'grayscale(60%)',
          ease: 'power2.out'
        })
      }
    })
  }, 650)
}

function closeModal() {
  visible.value = false
}

function onMaskEnter(el: Element, done: () => void) {
  gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, onComplete: done })
}
function onMaskLeave(el: Element, done: () => void) {
  gsap.to(el, { opacity: 0, duration: 0.25, onComplete: () => {
    done()
    emit('close')
  }})
}

onMounted(() => {
  phase.value = 'shuffling'
  const source = getRollSource()
  currentRollText.value = source[Math.floor(Math.random() * source.length)] || '?'
  runShuffling()
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1500px;
}
.card-container {
  transform-style: preserve-3d;
}
.card-inner {
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
}
.card-inner.is-flipped {
  transform: rotateY(180deg);
}
.card-front,
.card-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
/* 背面预先旋转 180deg，翻牌后内容正向显示 */
.card-back {
  transform: rotateY(180deg);
}
.selected-winner {
  animation: float-winner 2.2s ease-in-out infinite;
}
@keyframes float-winner {
  0%,
  100% {
    transform: translateY(0) scale(1.12);
    filter: drop-shadow(0 0 18px rgba(234, 179, 8, 0.5));
  }
  50% {
    transform: translateY(-20px) scale(1.12);
    filter: drop-shadow(0 0 28px rgba(234, 179, 8, 0.8));
  }
}
</style>
