<script setup lang="ts">
// Author mode only. Edits the open abnormality's entry and note; the reader's
// view below it in the file updates as you go.
import { computed } from 'vue'
import { AXES, WORKS } from '@/domain/catalog'
import type { Abnormality, AxisKey, WorkKey } from '@/domain/types'
import { useDraft } from './useDraft'

const props = defineProps<{
  abnormality: Abnormality
}>()

const draft = useDraft()
const code = computed(() => props.abnormality.code)
const entry = computed(() => draft.source.entries[code.value])

const note = computed({
  get: () => draft.source.note(code.value) ?? '',
  set: (text: string) => draft.setNote(code.value, text),
})

// Choosing the answer that is already chosen clears it.
function rate(axis: AxisKey, level: string): void {
  const current = entry.value?.rating?.[axis]
  draft.update(code.value, { rating: { [axis]: current === level ? undefined : level } })
}

function setWork(work: WorkKey, result: 'good' | 'bad'): void {
  const current = entry.value?.works?.[work]
  draft.update(code.value, { works: { [work]: current === result ? undefined : result } })
}

function setLogged(event: Event): void {
  const day = (event.target as HTMLInputElement).value
  // Clearing the field gives '': keep the day there was.
  if (day) draft.update(code.value, { logged: day })
}

function setLost(count: number): void {
  draft.update(code.value, { agentsLost: Number.isFinite(count) ? count : 0 })
}

function remove(): void {
  const question = `Remove ${props.abnormality.name} from the log? Its note goes with it.`
  if (window.confirm(question)) draft.remove(code.value)
}
</script>

<template>
  <section class="author">
    <h3>Author</h3>

    <button v-if="!entry" type="button" class="start" @click="draft.log(code)">
      Log this abnormality
    </button>

    <template v-else>
      <label class="field">
        <span class="lab">Field note</span>
        <textarea
          v-model="note"
          rows="8"
          spellcheck="true"
          placeholder="Whatever a reader should know. Leave a blank line between paragraphs."
        />
      </label>

      <div v-for="x in AXES" :key="x.key" class="field" :style="'--k:var(' + x.colorVar + ')'">
        <span :id="'author-' + x.key" class="lab">{{ $t('axis.' + x.key + '.label') }}</span>
        <div class="choices" role="group" :aria-labelledby="'author-' + x.key">
          <button
            v-for="level in x.levels"
            :key="level"
            type="button"
            :aria-pressed="entry.rating?.[x.key] === level"
            @click="rate(x.key, level)"
          >
            {{ $t('axis.' + x.key + '.levels.' + level) }}
          </button>
        </div>
      </div>

      <div v-if="!abnormality.tool" class="field">
        <span class="lab">{{ $t('works.title') }}</span>
        <div
          v-for="w in WORKS"
          :key="w.key"
          class="work"
          :style="'--k:' + w.color"
          role="group"
          :aria-label="$t('works.' + w.key)"
        >
          <span>{{ $t('works.' + w.key) }}</span>
          <div class="choices">
            <button
              v-for="result in (['good', 'bad'] as const)"
              :key="result"
              type="button"
              :aria-pressed="entry.works?.[w.key] === result"
              @click="setWork(w.key, result)"
            >
              {{ $t('works.result.' + result) }}
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <label class="field">
          <span class="lab">{{ $t('lost.title') }}</span>
          <input
            type="number"
            min="0"
            step="1"
            inputmode="numeric"
            :value="entry.agentsLost ?? 0"
            @change="setLost(($event.target as HTMLInputElement).valueAsNumber)"
          >
        </label>
        <label class="field">
          <span class="lab">Logged on</span>
          <input type="date" :value="entry.logged" @change="setLogged">
        </label>
      </div>

      <label class="check">
        <input
          type="checkbox"
          :checked="!!entry.fan"
          @change="draft.update(code, { fan: ($event.target as HTMLInputElement).checked })"
        >
        <span>{{ $t('review.fan') }}</span>
      </label>

      <button type="button" class="linkish remove" @click="remove">Remove from the log</button>
    </template>
  </section>
</template>

<style scoped lang="scss">
.author {
  margin-top: 18px;
  padding: 12px 14px 14px;
  border: 1px dashed var(--amber);
  display: grid;
  gap: 14px;
}

h3 {
  font: 600 .95rem/1.2 var(--display);
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--amber);
}

.field {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.lab {
  font-weight: 500;
  color: var(--dust);
  font-size: .9rem;
}

textarea,
input[type='number'],
input[type='date'] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--line);
  background: #000;
  color: var(--bone);
  font: inherit;
  color-scheme: dark;
}

textarea {
  // Grows with the note where the browser can; elsewhere it can be dragged taller.
  field-sizing: content;
  min-height: 9em;
  resize: vertical;
  line-height: 1.5;
}

textarea:focus-visible,
input:focus-visible,
button:focus-visible {
  outline: 2px solid var(--amber);
  outline-offset: 1px;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.choices button {
  flex: 1 1 auto;
  padding: 6px 10px;
  border: 1px solid var(--line);
  background: var(--cell);
  color: var(--bone);
  font: inherit;
  font-size: .9rem;
}

.choices button[aria-pressed='true'] {
  background: var(--k);
  border-color: var(--k);
  color: #000;
  font-weight: 600;
}

.work {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  border-left: 4px solid var(--k);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: end;
}

.check {
  display: flex;
  gap: 10px;
  align-items: center;
}

.check input {
  width: 20px;
  height: 20px;
  accent-color: var(--gold);
  flex: none;
}

.start {
  padding: 10px 14px;
  border: 1px solid var(--amber);
  background: var(--amber);
  color: #000;
  font: 600 1rem/1.2 var(--display);
  text-transform: uppercase;
  letter-spacing: .08em;
}

.remove {
  justify-self: start;
  padding-left: 0;
  color: var(--danger);
}
</style>
