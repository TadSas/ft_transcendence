from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, login, email, first_name, last_name, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(
            login=login,
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.save()

        return user