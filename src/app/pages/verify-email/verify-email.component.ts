import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-verify-email',
  imports: [CardModule, ButtonModule, ToastModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  providers: [MessageService]
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  countdown = 0;
  isVerifyDisable: boolean = false
  private timerSub?: Subscription
  emailCooldown: string = 'emailCooldown'

  constructor(private userService: UserService, private router: Router, private messageService: MessageService) {}

  ngOnInit(): void {
    this.checkCooldown();
  }

  ngOnDestroy(): void {
      if (this.timerSub) {
        this.timerSub.unsubscribe();
      }
  }

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }

  async onSendVerificationEmail() {
    try {
      const user = await firstValueFrom(this.userService.currentUser$);
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.isVerifyDisable = true
      await this.userService.sendEmailVerification();
      const nextAvailableTime = Date.now() + 60 * 1000;
      localStorage.setItem(this.emailCooldown, nextAvailableTime.toString());
      // this.startCountdown();
      this.router.navigate(['/first-time-login'])
    } catch (error: any) {
      this.isVerifyDisable = false
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    }
  }

  private startCountdown(seconds: number = 60) {
    this.countdown = seconds;
    this.isVerifyDisable = true;

    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
    this.timerSub = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.isVerifyDisable = false;
        localStorage.removeItem(this.emailCooldown);
        if (this.timerSub) {
          this.timerSub.unsubscribe();
        }
      }
    })
  }

  private checkCooldown() {
    const storedTime = localStorage.getItem(this.emailCooldown);
    if (storedTime) {
      const timeLeft = parseInt(storedTime) - Date.now();
      if (timeLeft > 0) {
        this.startCountdown(Math.ceil(timeLeft / 1000));
      }
    }
  }
}
