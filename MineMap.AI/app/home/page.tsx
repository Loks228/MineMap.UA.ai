import Link from "next/link"
import { AlertTriangle, ArrowRight, Shield, Map, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="mb-6 p-3 bg-red-500/20 rounded-full">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Система інформування про вибухонебезпечні предмети</h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Інтегрована система підвищення інформаційної обізнаності населення щодо загроз, пов'язаних із
              вибухонебезпечними предметами та уламками
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Перейти до карти
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Дізнатися більше
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Вхід</TabsTrigger>
                <TabsTrigger value="register">Реєстрація</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Вхід в систему</CardTitle>
                    <CardDescription>Введіть свої облікові дані для доступу до системи інформування</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Ім'я користувача</Label>
                      <Input id="username" placeholder="Введіть ім'я користувача" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <Input id="password" type="password" placeholder="Введіть пароль" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Увійти</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Створення облікового запису</CardTitle>
                    <CardDescription>Зареєструйтесь для отримання доступу до системи інформування</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Ім'я користувача</Label>
                      <Input id="reg-username" placeholder="Оберіть ім'я користувача" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Введіть email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Повне ім'я</Label>
                      <Input id="full-name" placeholder="Введіть повне ім'я" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Пароль</Label>
                      <Input id="reg-password" type="password" placeholder="Створіть пароль" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Зареєструватися</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Status Legend Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Позначення статусів територій</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-md">
              <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
              <span>Секретна</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-md">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <span>Замінована</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-md">
              <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
              <span>Непідтверджена</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md">
              <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
              <span>Архів</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-md">
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
              <span>Розмінована</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Можливості системи</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="mb-4 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Map className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Інтерактивна карта</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Перегляд інтерактивної карти з позначеними вибухонебезпечними об'єктами. Можливість фільтрації за
                  статусом, типом та пріоритетом.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-4 w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Сповіщення</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Отримання сповіщень про нові виявлені об'єкти у вашому регіоні. Можливість налаштування параметрів
                  сповіщень.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-4 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Безпека</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Рекомендації щодо безпечної поведінки при виявленні вибухонебезпечних предметів. Інструкції з
                  евакуації та повідомлення відповідних служб.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Про систему</h2>
            <div className="prose prose-lg mx-auto">
              <p>
                Наша система дозволяє ефективно збирати, обробляти та обмінюватися інформацією між спеціалізованими
                підрозділами, залученими до процесів розмінування. Завдяки використанню сучасних цифрових технологій,
                включаючи інтерактивні карти, сповіщення в реальному часі та аналітичні інструменти, платформа
                забезпечує координацію дій та оперативне реагування.
              </p>
              <p>
                Після реєстрації ви отримаєте доступ до інтерактивної карти, де можна переглядати інформацію про
                вибухонебезпечні предмети та уламки. Сапери можуть додавати нові точки, оновлювати статуси та планувати
                маршрути для розмінування. Система також надає аналітичні дані для ефективного планування робіт.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-xl font-bold">Система інформування</span>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link href="#" className="hover:text-gray-300">
                Головна
              </Link>
              <Link href="#" className="hover:text-gray-300">
                Про систему
              </Link>
              <Link href="#" className="hover:text-gray-300">
                Контакти
              </Link>
              <Link href="#" className="hover:text-gray-300">
                Допомога
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2023 Система інформування про вибухонебезпечні предмети. Всі права захищено.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
