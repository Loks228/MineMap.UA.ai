from fastapi import Request, HTTPException, status
from fastapi.security import OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from typing import Optional, Dict
from starlette.status import HTTP_401_UNAUTHORIZED

class OAuth2PasswordBearerWithCookie(OAuth2):
    """
    Расширение OAuth2PasswordBearer для поддержки куки
    """
    def __init__(self, tokenUrl: str, auto_error: bool = True):
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": {}})
        super().__init__(flows=flows, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        # Сначала проверяем заголовок Authorization
        authorization = request.headers.get("Authorization")
        if authorization:
            scheme, token = authorization.split()
            if scheme.lower() == "bearer":
                return token
        
        # Если заголовка нет, проверяем куки
        access_token = request.cookies.get("access_token")
        if access_token:
            # Куки могут содержать "Bearer " в начале и кавычки - удаляем их
            if access_token.startswith('"Bearer '):
                access_token = access_token.replace('"Bearer ', '').rstrip('"')
            elif access_token.startswith('Bearer '):
                access_token = access_token.replace('Bearer ', '')
            return access_token
        
        # Если токен не найден, выдаем исключение
        if self.auto_error:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None 