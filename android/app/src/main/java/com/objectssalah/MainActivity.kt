package com.objectssalah

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.annotation.Nullable
import com.baekgol.reactnativealarmmanager.AlarmModule
import com.baekgol.reactnativealarmmanager.util.BootReceiver
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val receiver = ComponentName(this, BootReceiver::class.java)
        val packageManager = this.packageManager

        packageManager.setComponentEnabledSetting(
            receiver,
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
        )
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return object : ReactActivityDelegate(this, mainComponentName) {
            @Nullable
            override fun getLaunchOptions(): Bundle? {
                val intent: Intent = intent
                val bundle = intent.extras

                if (intent.getBooleanExtra("notiRemovable", true)) {
                    AlarmModule.stop(this.context)
                }

                return bundle
            }
        }
    }

    override fun getMainComponentName(): String {
        return "PrayObjects"
    }
}
