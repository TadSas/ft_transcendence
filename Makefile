all:	up

up:
	@docker compose -f docker-compose.yml up -d --build

down:
	@docker compose -f docker-compose.yml down

re:
	$(MAKE) --no-print-directory down
	$(MAKE) --no-print-directory up

status:
	@docker ps -a

st:
	@$(MAKE) --no-print-directory status

clean:
	@docker stop $$(docker ps -qa) 2> /dev/null || true
	@docker rm $$(docker ps -qa) 2> /dev/null || true
	@docker rmi -f $$(docker images -qa) 2> /dev/null || true
	@docker volume rm $$(docker volume ls -q) 2> /dev/null || true
	@docker network rm $$(docker network ls -q) 2> /dev/null || true

fclean:	clean
	@docker system prune -af

.PHONY:	all up down re status st clean fclean
