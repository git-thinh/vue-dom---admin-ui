<template>
	<section class="hero is-fullheight">
		<div class="hero-body">
			<div class="container has-text-centered">
				<div class="column is-4 is-offset-4">
					<div class="box has-background-white-bis">
						<form @submit.prevent="login">
							<h3 class="title has-text-grey">{{ title }}</h3>
							<p class="subtitle has-text-grey">Login</p>
							<div class="field">
								<div class="control has-icons-left">
									<input v-model="credentials.login" class="input is-medium" type="text" name="login"
										placeholder="Username">
									<span class="icon is-small is-left">
										<i class="fa fa-user" />
									</span>
								</div>
							</div>
							<div class="field">
								<div class="control has-icons-left">
									<input v-model="credentials.password" class="input is-medium" type="password"
										name="password" placeholder="Password">
									<span class="icon is-small is-left">
										<i class="fa fa-key" />
									</span>
								</div>
							</div>
							<div class="field has-text-left pl-3">
								<o-checkbox v-model="credentials.remember"
									:class="{'has-text-grey-light': !credentials.remember}">
									Rester connecté
								</o-checkbox>
							</div>
							<div class="field">
								<button type="submit" class="button is-block is-primary is-medium is-fullwidth"
									:class="{'is-loading': isLoading}" :disabled="isDisabled"><span
										class="fa fa-sign-in-alt fa-fw mr-3" aria-hidden="true" />Login</button>
							</div>
							<div v-if="error" class="message is-danger">
								<div class="message-body has-text-danger">{{ error }}</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
	import {
		useAppStore
	} from '@/store/app'
	import {
		useAuthStore
	} from '@/store/auth'
	const custom = window.custom

	export default {
		name: 'Login',
		setup() {
			const appStore = useAppStore()
			const authStore = useAuthStore()
			return {
				appStore,
				authStore
			}
		},
		data() {
			return {
				title: custom.title,
				credentials: {
					login: '',
					password: '',
					remember: false,
				},
				isLoading: false,
				error: '',
			}
		},
		computed: {
			isDisabled() {
				return this.isLoading || !this.credentials.login || !this.credentials.password || !this.appStore.hasNetwork
			},
		},
		beforeMount() {
			// expose login function to global for outside calls
			window.vueDomLogin = {
				loginWithAuthentication: (login, authentication, remember) => this.loginWithAuthentication(login,
					authentication, remember),
			}
		},
		mounted() {
			// remove navbar spacing
			document.body.classList.remove('has-navbar-fixed-top')
		},
		methods: {
			async login() {
				// check credentials are set
				if (this.credentials.login === '' || this.credentials.password === '') {
					return
				}
				// call the auth service
				this.isLoading = true
				try {
					await this.authStore.doLogin(this.credentials.login, this.credentials.password, this.credentials
						.remember)
					// Auth successful, redirect to requested page of home by default
					if (this.$route.query.redirect !== undefined) {
						this.$router.replace(this.$route.query.redirect)
						return
					}
					this.$router.replace({
						name: 'home'
					})
				} catch (error) {
					// Auth failed, display error message
					this.appStore.setInformation({
						type: 'is-danger',
						message: error.message
					})
				}
				this.isLoading = false
			},
			async loginWithAuthentication(login, authentication, remember) {
				this.isLoading = true
				try {
					await this.authStore.loginWithPreviousAuthentication(login, authentication, remember)
					// Auth successful, redirect to requested page of home by default
					if (this.$route.query.redirect !== undefined) {
						this.$router.replace(this.$route.query.redirect)
						return
					}
					this.$router.replace({
						name: 'home'
					})
				} catch (error) {
					// Auth failed, display error message
					this.appStore.setInformation({
						type: 'is-danger',
						message: error.message
					})
				}
				this.isLoading = false
			},
		},
	}
</script>
