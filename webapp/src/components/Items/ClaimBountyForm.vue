<template lang="pug">
#ClaimBountyForm
  button.d-btn(
    data-bs-toggle="modal"
    data-bs-target="#claimBountyModal"
  ) {{$t('buttons.claimBounty')}}

  #claimBountyModal.modal.fade(
    tabindex='-1'
    aria-labelledby='exampleModalLabel'
    aria-hidden='true'
  )
    .modal-dialog.flex.justify-center
      .modal-content(class="w-6/12")
        .modal-header
          h5#exampleModalLabel.modal-title {{$t('bounty.title')}}
          button.btn-close(type='button' data-bs-dismiss='modal' aria-label='Close')
        .modal-body
          p.font-semibold {{$t('bounty.howToSubmit.description')}}
            a.pl-1.cryptedmail.doom-color-secondary(href="#"
              :data-name="name"
              :data-domain="domain"
              :data-tld="tld"
              @onclick="onEmailClick"
            )
          ul.list-disc.ml-10.mt-4
            li.mb-2(
              v-for="(value, index) in $tm('bounty.howToSubmit.instructions')"
              :key="`instruction_${index}`"
            ) {{value}}
        .modal-footer
          button.d-btn(type='button' data-bs-dismiss='modal') {{$t('buttons.close')}}

</template>


<script setup lang="ts">
import { ref } from 'vue'

const name = ref('info')
const domain = ref('gamehoundgames')
const tld = ref('com')

function onEmailClick() {
  window.location.href = `mailto: ${name.value}@${domain.value}.${tld.value}`;
  return false
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

.cryptedmail:after {
  content: attr(data-name) "@" attr(data-domain) "." attr(data-tld);
}
</style>
