<script lang='ts'>
    import { alertController } from 'ionic-svelte';
    import { checkmark, informationCircleOutline, reloadOutline } from 'ionicons/icons';
    import sisAuthenticator from "$lib/-universis/authenticator-deprecated/core";
    import { toastController } from 'ionic-svelte';
	import type { ToastOptions } from '@ionic/core';
	import { userCreds } from '$stores/credentials.store';
    import { userCredsFlag as autheticationFlag} from '$components/webmailLogin/userCredsFlagStore';
    import { t } from "$lib/i18n";

    export let loginModalOpen = false;

    const isProduction = process.env.NODE_ENV === 'production';
    import { Keyboard } from "@capacitor/keyboard";

    let modalCard: any;
    Keyboard.addListener('keyboardWillShow', ev => {
        modalCard.setCurrentBreakpoint(0.9);
    });
    Keyboard.addListener('keyboardWillHide', () => {
        modalCard.setCurrentBreakpoint(0.5)
    });



    let authenticating: boolean = false;
    let loginFailed: boolean = false;
    let loginIcon = checkmark;

    $: loginIcon = loginFailed ? reloadOutline : checkmark;

    const showAlert = async () => {
        const options = {
            header: $t("credential.header"),
            subHeader: $t("credential.subheader"),
            message: $t("credential.message"),
            buttons: ['ΟΚ']
        };
        const alert = await alertController.create(options);
        alert.present();
    };
    
    async function showToast(toast: ToastOptions){
		const toast_ = await toastController.create(toast);
		toast_.present();
	}

    async function checkCredsValidity(username: string, password: string) {    
        const authResult = await sisAuthenticator(username, password);

        if (authResult.error == null && authResult.token) {
            userCreds.set({
                username: username,
                password: password
            });

            autheticationFlag.set(true);

            loginModalOpen = false;
            
            return true;
        }
    
        return false;
    }


    async function submit(){        
        authenticating = true;

        let username = (document.getElementById('username') as HTMLInputElement).value.trim();
        let password = (document.getElementById('password') as HTMLInputElement)?.value;
        
        const validity = await checkCredsValidity(username, password);

        if (!validity || !password || !username) { 
            loginFailed = true;
            
            showToast({
                color: 'danger',
                duration: 1000,
                message: $t("credential.failed"),
                mode: 'ios',
                translucent: true,
                layout: 'stacked',
            });

            const usernameInput = document.getElementById('username') as HTMLIonInputElement;
            const passwordInput = document.getElementById('password') as HTMLIonInputElement;
            usernameInput?.setFocus();
            passwordInput.value = "";

        }
        else {
            loginFailed = false;

            showToast({
                color: 'success',
                duration: 1000,
                message: $t("credential.success"),
                mode: 'ios',
                translucent: true,
                layout: 'stacked',
            });
        }
        
        authenticating = false;
    }
</script>

<ion-modal
    is-open={loginModalOpen}
    initial-breakpoint={0.5}
    on:ionModalDidDismiss={() => {loginModalOpen = false;}}
    mode="ios"
    breakpoints={[0, 0.5, 0.6, 0.7, 0.9]}
    bind:this={modalCard}>

    <ion-content>
        <ion-card style="margin-block: 1rem; margin-block-end: 1.7rem">

                <div style="padding: 5%; color:var(--ion-color-dark); padding-bottom:2%">
                    <div style="margin-bottom:5%; font-size:large; display:flex; justify-content:space-between; align-items:center;">
                        {$t("credential.experience")}
                        <div style="display:flex; align-self:end; justify-content: space-between;">
                            {#if authenticating}
                            <ion-spinner name="crescent" color="primary" style="align-self:center;"></ion-spinner>
                            {:else}
                            <ion-button shape="round" size="small" id="login" on:ionFocus={submit}> 
                                <ion-icon slot="icon-only" id="checkmark" icon={loginIcon}></ion-icon>
                            </ion-button>
                            {/if}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2%">
                        {$t("credential.save_account")}
                        <ion-icon src={informationCircleOutline} on:click={showAlert} aria-hidden/>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; margin-top:0; padding-bottom:2%;">
                        
                        <ion-input
                        label={$t("credential.academic_name")}
                        label-placement="floating"
                        id="username"
                        type="text"
                        contenteditable="true"
                        spellcheck={false}
                        clear-input={true}
                        style="margin-bottom:0%; padding-bottom:0;"
                        />
                        
                        <ion-input
                        label={$t("credential.password")}
                        label-placement="floating"
                        id="password"
                        type="password"
                        contenteditable="true"
                        style="margin-bottom:5px;"
                        spellcheck={false}
                        clear-input={true}
                        />
                </div>
            </div>

        </ion-card>


    </ion-content>
</ion-modal>