<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-equipments'}, icon: 'fa-microchip', text: 'Équipements'}, {link: {name: 'admin-equipment', params: {id}}, text: equipment.name, isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-microchip" /></span><span>Informations de l'equipment</span>
            </p>
          </header>
          <section class="card-content">
            <div class="field is-required">
              <label class="label">Nom</label>
              <div class="control has-icons-left">
                <input v-model="equipment.name" class="input" type="text" placeholder="Nom de l'équipement">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>
            <div class="field is-required">
              <label class="label">Module</label>
              <div class="control has-icons-left">
                <input v-model="equipment.module" class="input" type="text" placeholder="Module gérant l'équipement">
                <span class="icon is-small is-left">
                  <i class="fas fa-cogs" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Identifiant logique</label>
              <div class="control has-icons-left">
                <input v-model="equipment.logicalId" class="input" type="text" placeholder="Identifiant logique (adresse MAC, ...)">
                <span class="icon is-small is-left">
                  <i class="fas fa-at" />
                </span>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Statut</label>
                <o-switch v-model="equipment.isActive">{{ equipment.isActive ? 'Actif' : 'Inactif' }}</o-switch>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Visibilité</label>
                <o-switch v-model="equipment.isVisible">{{ equipment.isVisible ? 'Visible' : 'Masqué' }}</o-switch>
              </div>
            </div>
            <div class="field">
              <label class="label">Emplacement</label>
              <div class="control">
                <div class="field has-addons">
                  <div class="control has-icons-left">
                    <span class="select">
                      <select v-model="equipment.roomId">
                        <option :value="null">Aucun</option>
                        <option v-for="room in dataStore.rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
                      </select>
                    </span>
                    <span class="icon is-small is-left">
                      <i class="fas fa-home" />
                    </span>
                  </div>
                  <div v-if="equipment.roomId" class="control">
                    <router-link class="button is-primary" :to="{name: 'admin-room', params: {id: equipment.roomId}}" title="Consulter l'emplacement"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
                  </div>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">Batterie</label>
              <div class="control has-icons-left has-icons-right">
                <input v-model="equipment.battery" class="input" :class="{'is-danger': equipment.hasLowBattery}" type="text" placeholder="Pourcentage de batterie restant" readonly disabled>
                <span class="icon is-small is-left">
                  <i class="fas fa-battery-three-quarters" />
                </span>
                <span v-if="equipment.hasLowBattery" class="icon is-small is-right has-text-danger">
                  <i class="fa fa-battery-empty" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Délai d'alerte sans communication (minutes)</label>
              <div class="control has-icons-left">
                <input v-model="alertNoCommunicationDelay" class="input" type="number" placeholder="Exemple 60 pour 1 heure, vide si pas de d'alerte">
                <span class="icon is-small is-left">
                  <i class="far fa-bell" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Dernière communication</label>
              <div class="control has-icons-left has-icons-right">
                <input v-model="equipmentLastCommunication" class="input" :class="{'is-danger': equipment.hasNoCommunication}" type="datetime" placeholder="Date de dernière communication" readonly disabled>
                <span class="icon is-small is-left">
                  <i class="far fa-clock" />
                </span>
                <span v-if="equipment.hasNoCommunication" class="icon is-small is-right has-text-danger">
                  <i class="fa fa-comment-slash" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Tags</label>
              <o-inputitems
                v-model="equipment.tags"
                :data="filteredTags"
                autocomplete
                allow-new
                open-on-focus
                icon="tags"
                placeholder="Nouveau tag"
                aria-close-label="Retirer ce tag"
                @typing="getFilteredTags"
              />
            </div>
            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder l'équipement" @click="saveEquipment">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir l'équipement" @click="getEquipment">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer l'équipement" @click="copyEquipment">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer l'équipement" @click="removeEquipment">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>
            </div>
          </section>
        </div>
        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-eye" /></span><span>États</span>
            </p>
          </header>
          <section class="card-content">
            <div class="table-container">
              <table class="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Module</th>
                    <th>Id. logique</th>
                    <th>Visibilité</th>
                    <th>Type</th>
                    <th>Icône</th>
                    <th>Dernière valeur</th>
                    <th>Dernière collecte</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="state in equipment.states" :key="state.id">
                    <td><router-link :to="{name: 'admin-state', params: {id: state.id}}">{{ state.name }}</router-link></td>
                    <td>{{ state.module }}</td>
                    <td>{{ state.logicalId }}</td>
                    <td><i class="fas fa-fw" :class="state.isVisible ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="state.isVisible ? 'Visible' : 'Masqué'" /></td>
                    <td :title="state.type"><i class="fa-fw" :class="getStateTypeClass(state.type)" /></td>
                    <td :title="state.genericType"><i class="fa-fw" :class="getIconClass(state)" /></td>
                    <td>{{ getFormattedStateCurrentValue(state) }} {{ state.unit }}</td>
                    <td>
                      <time-ago v-if="state.date" :date="state.date" :drop-fixes="true" title-format="PPPPpp" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="buttons">
              <button v-if="!isNew" class="button is-light is-primary" title="Ajouter un état" @click="addState">
                <span class="icon"><i class="fa fa-plus-circle" /></span><span>Ajouter</span>
              </button>
            </div>
          </section>
        </div>
        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-cogs" /></span><span>Actions</span>
            </p>
          </header>
          <section class="card-content">
            <div class="table-container">
              <table class="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Module</th>
                    <th>Id. logique</th>
                    <th>Visibilité</th>
                    <th>Type</th>
                    <th>Icône</th>
                    <th>Retour d'état</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="action in equipment.actions" :key="action.id">
                    <td><router-link :to="{name: 'admin-action', params: {id: action.id}}">{{ action.name }}</router-link></td>
                    <td>{{ action.module }}</td>
                    <td>{{ action.logicalId }}</td>
                    <td><i class="fas fa-fw" :class="action.isVisible ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="action.isVisible ? 'Visible' : 'Masqué'" /></td>
                    <td :title="action.type"><i class="fa-fw" :class="getActionTypeClass(action.type)" /></td>
                    <td :title="action.icon"><i class="fa-fw" :class="getIconClass(action)" /></td>
                    <td :title="action.stateFeedbackId">{{ dataStore.getStateById(action.stateFeedbackId).name || action.stateFeedbackId }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="buttons">
              <button v-if="!isNew" class="button is-light is-primary" title="Ajouter une action" @click="addAction">
                <span class="icon"><i class="fa fa-plus-circle" /></span><span>Ajouter</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import TimeAgo from '@/components/TimeAgo.vue'
import { useDataStore } from '@/store/data'
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'
import { useDialog } from '@/composables/useDialog'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { dtFormat } from '@/services/Datetime'
import { provider } from '@/services/Provider'

export default {
  name: 'Equipment',
  components: {
    Breadcrumb,
    TimeAgo,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    const { addUnsavedChangesGuard, removeUnsavedChangesGuard } = useUnsavedChangesGuard()
    const { confirmDelete } = useDialog()
    const { getStateTypeClass, getIconClass, getFormattedStateCurrentValue, getActionTypeClass } = useEquipmentsHelper()
    return { dataStore, addUnsavedChangesGuard, removeUnsavedChangesGuard, confirmDelete, getStateTypeClass, getIconClass, getFormattedStateCurrentValue, getActionTypeClass }
  },
  data () {
    return {
      equipment: {
        isActive: false,
        isVisible: false,
        roomId: null,
        tags: [],
      },
      filteredTags: [],
      isLoading: false,
    }
  },
  computed: {
    isNew () {
      return this.id === 'new'
    },
    equipmentLastCommunication () {
      return this.equipment.lastCommunication ? dtFormat(this.equipment.lastCommunication, 'PPPPpp') : null
    },
    alertNoCommunicationDelay: {
      get: function () {
        return this.equipment.alertNoCommunicationDelay
      },
      set: function (string) {
        if (string === '') {
          this.equipment.alertNoCommunicationDelay = null
          return
        }
        this.equipment.alertNoCommunicationDelay = parseInt(string)
      },
    },
  },
  mounted () {
    if (!this.isNew) {
      this.getEquipment()
    } else {
      this.addUnsavedChangesGuard(this.equipment)
      if (history.state.proposal) {
        this.equipment = Object.assign({}, this.equipment, history.state.proposal)
      }
    }
  },
  methods: {
    async getEquipment () {
      this.isLoading = true
      this.equipment = Object.assign({}, this.equipment, await provider.getEquipment(this.id))
      this.addUnsavedChangesGuard(this.equipment)
      this.getFilteredTags()
      this.isLoading = false
    },
    async saveEquipment () {
      this.isLoading = true
      const equipment = Object.assign({}, this.equipment)
      delete equipment.battery
      delete equipment.lastCommunication
      delete equipment.actions
      delete equipment.states
      const result = await this.dataStore.vxSaveEquipment({ equipment, isNew: this.isNew })
      if (result) {
        if (this.isNew) {
          this.removeUnsavedChangesGuard()
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.equipment = Object.assign(this.equipment, result)
        this.addUnsavedChangesGuard(this.equipment)
      }
      this.isLoading = false
    },
    copyEquipment () {
      const proposal = JSON.parse(JSON.stringify(this.equipment))
      delete proposal.id
      delete proposal.logicalId
      delete proposal.battery
      delete proposal.hasLowBattery
      delete proposal.lastCommunication
      delete proposal.hasNoCommunication
      delete proposal.actions
      delete proposal.states
      proposal.name = `${proposal.name} (copie)`
      this.$router.push({
        name: 'admin-equipment',
        params: {
          id: 'new',
        },
        state: {
          proposal,
        },
      }).catch(() => {})
    },
    async removeEquipment () {
      if (await this.confirmDelete('L\'équipement sera supprimé ainsi que ses actions et états.')) {
        this.isLoading = true
        if (await this.dataStore.vxDeleteEquipment({ equipmentId: this.equipment.id, roomId: this.equipment.roomId })) {
          this.removeUnsavedChangesGuard()
          this.$router.back()
        }
        this.isLoading = false
      }
    },
    getFilteredTags (query) {
      this.filteredTags = this.dataStore.tagsList.filter((tag) => {
        // remove tags already present and filter with query if provided
        return (!this.equipment.tags.includes(tag) && (query === undefined || tag
          .toLowerCase()
          .indexOf(query.toLowerCase()) >= 0)
        )
      })
    },
    addState () {
      this.$router.push({
        name: 'admin-state',
        params: {
          id: 'new',
        },
        state: {
          proposal: {
            eqId: this.equipment.id,
            module: this.equipment.module,
          },
        },
      }).catch(() => {})
    },
    addAction () {
      this.$router.push({
        name: 'admin-action',
        params: {
          id: 'new',
        },
        state: {
          proposal: {
            eqId: this.equipment.id,
            module: this.equipment.module,
          },
        },
      }).catch(() => {})
    },
  },
}
</script>
