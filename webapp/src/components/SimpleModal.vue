<template lang="pug">
#SimpleModal
  button.d-btn(
    @click="toggleModal"
  ) {{btnText}}

  .modal.fade(
    ref="simpleModal"
    tabindex='-1'
    aria-hidden='true'
  )
    .modal-dialog.flex.justify-center
      .modal-content(class="w-4/5 lg:w-1/2 xl:1/4")
        .modal-header
          h5.modal-title.doom-color-secondary.doom-text-shadow-danger {{title}}
          button.btn-close(type='button' data-bs-dismiss='modal' aria-label='Close')
        .modal-body.text-white
          slot

        .modal-footer
          button.d-btn(
            type='button'
            @click="toggleModal"
          ) {{$t('buttons.close')}}
</template>


<script setup lang="ts">
import { ref, onMounted  } from 'vue'
import { Modal } from 'bootstrap'

const props = defineProps<{
  title: string,
  btnText: string,
}>()

const simpleModal = ref(null)
const modal = ref()


onMounted(() => {
  modal.value = new Modal(simpleModal.value)
})


function toggleModal() {
  modal.value?.toggle()
}

</script>


<style lang="scss" scoped>
@import '@/assets/styles/doom.scss';

.modal-dialog {
  max-width: 100%;
  letter-spacing: 1px;
}

.modal-content {
  background-color: $doomColorAlt;
}
</style>
