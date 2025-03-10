<script lang="ts">
	import type { ToastOptions } from '@ionic/core';
	import * as allIonicIcons from 'ionicons/icons';
	import { toastController } from 'ionic-svelte';
	import cog_solid from '$customIcons/cog-solid.svg';
	import launchNativenotificationSettings from '$lib/functions/nativeSettings/launchNotificationSettings';
	import { Capacitor } from '@capacitor/core';
	import Dexie from 'dexie';
	import { onMount } from 'svelte';
	import { checkAppMode, toggleDarkTheme } from '$lib/globalFunctions/darkMode';
	import CredentialLoginItem from '$components/webmailLogin/CredentialLoginItem.svelte';
	import Modal, { getModal } from '$components/language/Modal.svelte';
	import { t } from '$lib/i18n';
	import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';

	/**
	 * @type {any}
	 */
	export let logOut;

	onMount(() => {
		checkAppMode();
	});

	async function showToast(toast: ToastOptions) {
		const toast_ = await toastController.create(toast);
		toast_.present();
	}

	async function dixieGet(key: string) {
		var db = new Dexie('cachedData');
		db.version(1).stores({
			cachedData: 'key,value'
		});

		const cachedData = (await db.cachedData.get(key)).value;

		return cachedData;
	}

	async function dixieGetKeys() {
		var db = new Dexie('cachedData');
		db.version(1).stores({
			cachedData: 'key,value'
		});

		const keys = (await db.cachedData.toArray()).map((item) => item.key);

		return keys;
	}

	async function sentAnalytics() {
		// Send subjects json to the server for debugging

		const url = 'https://analytics.neron.dev/v1/analytics';

		let examkeys = (await dixieGetKeys()).filter((key) =>
			key.includes('universis_students/me/exams')
		);
		let keys = [
			'universis_students/me/courses?$top=-1',
			'universis_students/me/grades?$filter=courseExam/year eq 2023 and courseExam/examPeriod eq 1&$expand=status,course($expand=gradeScale,locale),courseClass($expand=instructors($expand=instructor($select=InstructorSummary))),courseExam($expand=examPeriod,year)&$top=-1&$count=false',
			...examkeys
		];
		if (
			(await dixieGetKeys()).includes(
				'universis_students/me/Registrations?$expand=classes($expand=courseType($expand=locale),courseClass($expand=course($expand=locale),instructors($expand=instructor($select=InstructorSummary))))&$top=-1&$skip=0&$count=false'
			)
		) {
			keys.push(
				'universis_students/me/Registrations?$expand=classes($expand=courseType($expand=locale),courseClass($expand=course($expand=locale),instructors($expand=instructor($select=InstructorSummary))))&$top=-1&$skip=0&$count=false'
			);
		}

		let file: any = {
			medata: [
				JSON.parse(await dixieGet('universis_Students/me/')).value.semester,
				JSON.parse(await dixieGet('universis_Students/me/department')).value.abbreviation
			]
		};

		for (let i = 0; i < keys.length; i++) {
			file[keys[i]] = JSON.parse(await dixieGet(keys[i]));
		}

		console.log(file);
		let options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(file)
		};
		await fetch(url, options)
			.then((response) => {
				if (!response.ok) {
					showToast({
						color: 'danger',
						duration: 3000,
						message: $t('settings.analyticsFailed'),
						mode: 'ios',
						translucent: true,
						position: 'bottom',
						positionAnchor: 'tab-button-homepage',
						layout: 'stacked'
					});
					throw new Error('Network response was not ok');
				} else {
					showToast({
						color: 'success',
						duration: 3000,
						message: $t('settings.analyticsSucceded'),
						mode: 'ios',
						translucent: true,
						position: 'bottom',
						positionAnchor: 'tab-button-homepage',
						layout: 'stacked'
					});
				}
				return response.json();
			})
			.then((data) => {
				console.log('Response:', data);
			})
			.catch((error) => {
				console.error('There was a problem with the fetch operation:', error);
			});
	}

	const updateButton = async () => {
		const update = await AppUpdate.getAppUpdateInfo();

		if (update.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
			await AppUpdate.openAppStore();
		} else {
			showToast({
				color: 'danger',
				duration: 3000,
				message: $t('update.noUpdate'),
				mode: 'ios',
				translucent: true,
				position: 'bottom',
				positionAnchor: 'tab-button-homepage',
				layout: 'stacked'
			});
		}
	};
</script>

<ion-card>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<ion-card-content>
		<ion-item>
			<ion-icon size="small" icon={allIonicIcons.brush} />
			<ion-toggle
				id="themeToggle"
				class="ion-padding-start"
				checked={localStorage.getItem('darkMode') === 'true'}
				on:ionChange={toggleDarkTheme}
			>
				Dark Mode
			</ion-toggle>
		</ion-item>

		<CredentialLoginItem />

		{#if Capacitor.isNativePlatform()}
			<ion-item button on:click={launchNativenotificationSettings} aria-hidden>
				<ion-icon size="small" icon={cog_solid} />
				<ion-label class="ion-padding-start">{$t('settings.notifications')}</ion-label>
				<ion-icon size="small" icon={allIonicIcons.chevronForwardCircle} aria-hidden />
			</ion-item>
		{/if}

		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<ion-item button on:click={() => getModal().open()}>
			<ion-icon size="small" icon={allIonicIcons.language} />
			<ion-label class="ion-padding-start">{$t('settings.language')}</ion-label>
			<ion-icon size="small" icon={allIonicIcons.chevronForwardCircle} />
		</ion-item>

		<ion-item button href="/about">
			<ion-icon size="small" icon={allIonicIcons.people} />
			<ion-label class="ion-padding-start">{$t('settings.about')}</ion-label>
			<ion-icon size="small" icon={allIonicIcons.chevronForwardCircle} />
		</ion-item>

		<ion-item button href="/faq">
			<ion-icon size="small" icon={allIonicIcons.helpCircle} />
			<ion-label class="ion-padding-start">FAQ</ion-label>
			<ion-icon size="small" icon={allIonicIcons.chevronForwardCircle} />
		</ion-item>

		<ion-item button href="/login/guide">
			<ion-icon size="small" icon={allIonicIcons.helpCircle} />
			<ion-label class="ion-padding-start">{$t('settings.guide')}</ion-label>
			<ion-icon size="small" icon={allIonicIcons.chevronForwardCircle} />
		</ion-item>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<ion-item button on:click={updateButton}>
			<ion-icon size="small" icon={allIonicIcons.syncCircle} />
			<ion-label class="ion-padding-start">{$t('update.updateButton')}</ion-label>
			<ion-icon size="small" icon={allIonicIcons.chevronForwardCircle} />
		</ion-item>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<ion-item button on:click={sentAnalytics}>
			<ion-icon size="small" icon={allIonicIcons.paperPlane} />
			<ion-label class="ion-padding-start">{$t('settings.analytics')}</ion-label>
			<ion-icon size="small" icon={allIonicIcons.chevronForwardCircle} />
		</ion-item>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<ion-item button lines="none" on:click={logOut}>
			<ion-icon color="danger" size="small" icon={allIonicIcons.exit} />

			<ion-label color="danger" class="ion-padding-start">{$t('settings.logout')}</ion-label>
			<ion-icon color="danger" size="small" icon={allIonicIcons.chevronForwardCircle} />
		</ion-item>
	</ion-card-content>
</ion-card>

<!-- the modal without an `id` -->
<Modal />

<style>
	ion-icon {
		color: var(--app-color-icons);
	}
</style>
