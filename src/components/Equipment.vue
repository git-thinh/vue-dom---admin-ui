<template>
  <article class="card mb-4">
    <header class="card-header">
      <p class="card-header-title">{{ equipment.name }}<router-link v-if="authStore.hasRole('admin')" :to="{name: 'admin-equipment', params: {id: equipment.id}}" title="Gérer l'équipement"><i class="fas ml-2 fa-sm fa-tools has-text-grey-light" /></router-link></p>
      <aside class="card-header-icon is-size-7-mobile">
        <span v-if="equipment.battery" :class="[equipment.hasLowBattery ? 'has-text-danger' : 'has-text-grey']"><i class="fa-mr" :class="getBatteryLevelIconClass(equipment.battery)" />{{ equipment.battery }}%</span>
        <span v-if="equipment.lastCommunication" :title="lastCommunicationTitle" :class="[equipment.hasNoCommunication ? 'has-text-danger' : 'has-text-grey']" class="ml-2"><i class="fa-mr far fa-clock" /><time-ago :date="equipment.lastCommunication" :drop-fixes="true" :is-strict="false" /></span>
      </aside>
    </header>
    <custom-component v-if="isEquipmentHandled(equipment.module)" :component="getEquipmentComponent(equipment.module)" :equipment="equipment" class="card-content" />
    <generic-component v-else :equipment="equipment" class="card-content" />
  </article>
</template>

<script>
import TimeAgo from '@/components/TimeAgo.vue'
import CustomComponent from '@/components/equipment/CustomComponent.vue'
import GenericComponent from '@/components/equipment/GenericComponent.vue'
import { useDataStore } from '@/store/data'
import { useAuthStore } from '@/store/auth'
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'
import { dtFormat } from '@/services/Datetime'
const custom = window.custom

export default {
  name: 'Equipment',
  components: {
    TimeAgo,
    CustomComponent,
    GenericComponent,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    const authStore = useAuthStore()
    const { getBatteryLevelIconClass } = useEquipmentsHelper()
    return { dataStore, authStore, getBatteryLevelIconClass }
  },
  computed: {
    equipment () {
      return this.dataStore.getEquipmentById(this.id)
    },
    lastCommunicationTitle () {
      return dtFormat(this.equipment.lastCommunication, 'PPPPpp')
    },
  },
  methods: {
    getEquipmentComponent (moduleName) {
      return custom.components[moduleName]
    },
    isEquipmentHandled (moduleName) {
      return (custom.components[moduleName] !== undefined)
    },
  },
}
</script>
